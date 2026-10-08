"""
MaxFunded MT5 Python Poller Service
====================================
Runs locally on Windows alongside your MT5 terminal.
No EA script needed — this Python service directly talks to MT5.

HOW IT WORKS:
  1. Reads all ACTIVE challenge purchases from the database
  2. For each account: logs into MT5, reads account_info + open positions
  3. POSTs that data to your existing FastAPI bridge endpoints
  4. Your risk engine fires → breach/pass detection → dashboard updates live

REQUIREMENTS:
  - Windows OS (MetaTrader5 Python lib is Windows only)
  - MetaTrader 5 terminal installed and running
  - pip install MetaTrader5 requests

HOW TO RUN:
  # From the backend/ directory:
  python mt5_poller.py

  # Or with custom interval (default 5 seconds):
  python mt5_poller.py --interval 10

  # Run once and exit (useful for testing):
  python mt5_poller.py --once
"""

import argparse
import asyncio
import logging
import sys
import time
from datetime import datetime
from typing import Optional

import httpx

# ── UTF-8 console output for Windows ──────────────────────────────────────────
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)
        sys.stderr.reconfigure(encoding="utf-8", line_buffering=True)
    except Exception:
        pass

# ── Logging setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  [%(levelname)s]  %(message)s",
    datefmt="%H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("mt5_poller.log", encoding="utf-8"),
    ],
)
log = logging.getLogger("mt5_poller")

# ── Configuration ──────────────────────────────────────────────────────────────
BRIDGE_BASE_URL = "http://127.0.0.1:8000/api/v1"
try:
    import sys, os
    sys.path.insert(0, os.path.dirname(__file__))
    from app.core.config import settings as _cfg
    BRIDGE_SECRET = getattr(_cfg, "MT5_BRIDGE_SECRET", "change-me-in-production-32chars-secure")
except Exception:
    BRIDGE_SECRET = "change-me-in-production-32chars-secure"

POLL_INTERVAL   = 5          # seconds between full sweep
MAX_ACCOUNTS    = 50         # safety cap per sweep
SWITCH_DELAY    = 0.3        # seconds to wait after switching MT5 account

# ── Try importing MetaTrader5 ─────────────────────────────────────────────────
try:
    import MetaTrader5 as mt5
    MT5_AVAILABLE = True
except ImportError:
    MT5_AVAILABLE = False
    log.warning(
        "MetaTrader5 package not installed. Running in SIMULATION MODE.\n"
        "Install with:  pip install MetaTrader5\n"
        "Note: Only works on Windows with MT5 terminal installed."
    )

# ── Database access (sync SQLAlchemy for the poller) ─────────────────────────
try:
    from sqlalchemy import create_engine, text
    from sqlalchemy.orm import sessionmaker

    # Resolve same DB path used by the backend
    import sys, os
    sys.path.insert(0, os.path.dirname(__file__))
    from app.core.config import settings as _cfg

    _sync_url = _cfg.DATABASE_URL_SYNC
    _engine   = create_engine(_sync_url, connect_args={"check_same_thread": False} if "sqlite" in _sync_url else {})
    _Session  = sessionmaker(bind=_engine)
    DB_AVAILABLE = True
    log.info("Database connected: %s", _sync_url.split("///")[-1])
except Exception as e:
    DB_AVAILABLE = False
    log.warning("Could not connect to database: %s — will use demo fallback.", e)


# ─────────────────────────────────────────────────────────────────────────────
# Database helpers
# ─────────────────────────────────────────────────────────────────────────────

def get_active_accounts() -> list[dict]:
    """
    Returns list of dicts with keys:
      id, mt5_login, mt5_password, mt5_server, current_balance
    for every ACTIVE challenge purchase that has MT5 credentials.
    """
    if not DB_AVAILABLE:
        # Demo fallback — returns a dummy account so you can test the flow
        log.warning("Using demo fallback account (DB unavailable)")
        return [
            {
                "id": "demo-purchase-001",
                "mt5_login": "88000001",
                "mt5_password": "Demo1234!",
                "mt5_server": "MetaQuotes-Demo",
                "current_balance": 10000.0,
            }
        ]

    try:
        with _Session() as session:
            rows = session.execute(text("""
                SELECT id, mt5_login, mt5_password, mt5_server, current_balance
                FROM challenge_purchases
                WHERE status = 'ACTIVE'
                  AND mt5_login IS NOT NULL
                  AND mt5_password IS NOT NULL
                LIMIT :limit
            """), {"limit": MAX_ACCOUNTS}).fetchall()

            return [
                {
                    "id": str(r[0]),
                    "mt5_login": str(r[1]),
                    "mt5_password": str(r[2]),
                    "mt5_server": str(r[3]) if r[3] else "MetaQuotes-Demo",
                    "current_balance": float(r[4]) if r[4] else 0.0,
                }
                for r in rows
            ]
    except Exception as e:
        log.error("DB query failed: %s", e)
        return []


# ─────────────────────────────────────────────────────────────────────────────
# MT5 helpers
# ─────────────────────────────────────────────────────────────────────────────

def mt5_init(path: Optional[str] = None) -> bool:
    """Initialise the MT5 terminal connection. Returns True on success."""
    if not MT5_AVAILABLE:
        return False
    ok = mt5.initialize(path=path) if path else mt5.initialize()
    if not ok:
        log.error("mt5.initialize() failed: %s", mt5.last_error())
        return False
    info = mt5.terminal_info()
    if info:
        log.info("MT5 terminal connected | build=%s | path=%s", info.build, info.path)
    return True


def mt5_login_account(login: str, password: str, server: str) -> bool:
    """Switch to a specific MT5 account. Returns True on success."""
    if not MT5_AVAILABLE:
        return False
    result = mt5.login(int(login), password=password, server=server)
    if not result:
        log.warning("Login failed for %s@%s: %s", login, server, mt5.last_error())
    return result


def read_account_snapshot(login: str) -> Optional[dict]:
    """
    Read account_info and open positions for the current logged-in MT5 account.
    Returns a dict ready to POST to the bridge.
    """
    if not MT5_AVAILABLE:
        # Simulation: generate realistic-looking random equity
        import random
        base = 10000.0
        equity = round(base + random.uniform(-400, 600), 2)
        balance = round(base + random.uniform(-200, 400), 2)
        return {
            "mt5_login": login,
            "current_equity": equity,
            "current_balance": balance,
            "margin": round(random.uniform(0, 500), 2),
            "free_margin": round(equity - random.uniform(0, 500), 2),
        }

    info = mt5.account_info()
    if info is None:
        log.warning("account_info() returned None for login %s", login)
        return None

    return {
        "mt5_login": str(info.login),
        "current_equity": float(info.equity),
        "current_balance": float(info.balance),
        "margin": float(info.margin),
        "free_margin": float(info.margin_free),
    }


def read_open_positions(login: str) -> list[dict]:
    """
    Read all open positions for current account.
    Returns list of trade event dicts.
    """
    if not MT5_AVAILABLE:
        return []

    positions = mt5.positions_get()
    if positions is None or len(positions) == 0:
        return []

    results = []
    for pos in positions:
        results.append({
            "mt5_login": str(pos.ticket),   # using ticket as unique id
            "ticket": str(pos.ticket),
            "symbol": pos.symbol,
            "trade_type": "BUY" if pos.type == 0 else "SELL",
            "lots": float(pos.volume),
            "open_price": float(pos.price_open),
            "close_price": None,
            "stop_loss": float(pos.sl) if pos.sl else None,
            "take_profit": float(pos.tp) if pos.tp else None,
            "profit": float(pos.profit),
            "commission": float(pos.commission) if hasattr(pos, "commission") else 0.0,
            "swap": float(pos.swap) if hasattr(pos, "swap") else 0.0,
            "current_balance": None,
            "current_equity": None,
            "status": "OPEN",
            "comment": pos.comment if hasattr(pos, "comment") else None,
        })
    return results


def close_all_open_positions(comment: str = "MaxFunded Breach Stop") -> int:
    """
    Enforces risk limit stop by immediately closing all open positions in MT5.
    Returns the count of successfully closed positions.
    """
    if not MT5_AVAILABLE:
        log.warning("MT5 library not available to close positions.")
        return 0

    positions = mt5.positions_get()
    if positions is None or len(positions) == 0:
        return 0

    closed = 0
    for pos in positions:
        try:
            symbol = pos.symbol
            tick = mt5.symbol_info_tick(symbol)
            if not tick:
                log.error("Cannot fetch tick for symbol %s to close ticket %s", symbol, pos.ticket)
                continue

            order_type = mt5.ORDER_TYPE_SELL if pos.type == mt5.ORDER_TYPE_BUY else mt5.ORDER_TYPE_BUY
            price = tick.bid if pos.type == mt5.ORDER_TYPE_BUY else tick.ask

            filling_types = [
                getattr(mt5, "ORDER_FILLING_IOC", 1),
                getattr(mt5, "ORDER_FILLING_FOK", 0),
                getattr(mt5, "ORDER_FILLING_RETURN", 2),
            ]

            success = False
            for filling in filling_types:
                request = {
                    "action": mt5.TRADE_ACTION_DEAL,
                    "position": pos.ticket,
                    "symbol": symbol,
                    "volume": float(pos.volume),
                    "type": order_type,
                    "price": float(price),
                    "deviation": 25,
                    "magic": getattr(pos, "magic", 0),
                    "comment": comment,
                    "type_time": mt5.ORDER_TIME_GTC,
                    "type_filling": filling,
                }
                res = mt5.order_send(request)
                if res and res.retcode == mt5.TRADE_RETCODE_DONE:
                    closed += 1
                    success = True
                    log.warning(
                        "🛑 CLOSED position ticket=%s on %s volume=%.2f at %.5f (retcode=%s)",
                        pos.ticket, symbol, pos.volume, price, res.retcode
                    )
                    break

            if not success:
                log.error(
                    "Failed to close position %s on %s (last error=%s)",
                    pos.ticket, symbol, mt5.last_error()
                )
        except Exception as e:
            log.error("Exception closing position %s: %s", getattr(pos, "ticket", "?"), e)

    return closed


def read_closed_deals_since(login: str, from_dt: datetime) -> list[dict]:
    """
    Read deals closed since from_dt for the current MT5 account.
    """
    if not MT5_AVAILABLE:
        return []

    import MetaTrader5 as mt5  # noqa
    deals = mt5.history_deals_get(from_dt, datetime.now())
    if deals is None or len(deals) == 0:
        return []

    results = []
    for deal in deals:
        if deal.entry != 1:   # entry=1 means deal_out (position closed)
            continue
        results.append({
            "mt5_login": login,
            "ticket": str(deal.ticket),
            "symbol": deal.symbol,
            "trade_type": "BUY" if deal.type == 0 else "SELL",
            "lots": float(deal.volume),
            "open_price": float(deal.price),
            "close_price": float(deal.price),
            "profit": float(deal.profit),
            "commission": float(deal.commission),
            "swap": float(deal.swap),
            "current_balance": None,
            "current_equity": None,
            "status": "CLOSED",
            "comment": deal.comment if hasattr(deal, "comment") else None,
        })
    return results


# ─────────────────────────────────────────────────────────────────────────────
# HTTP bridge sender
# ─────────────────────────────────────────────────────────────────────────────

def post_equity_tick(client: httpx.Client, payload: dict) -> Optional[dict]:
    """POST one equity tick to the FastAPI bridge."""
    try:
        r = client.post(
            f"{BRIDGE_BASE_URL}/trading/mt5/bridge/equity",
            json=payload,
            headers={"X-MT5-Bridge-Secret": BRIDGE_SECRET},
            timeout=8,
        )
        if r.status_code == 200:
            return r.json()
        else:
            log.warning("Bridge equity error %s: %s", r.status_code, r.text[:120])
            return None
    except httpx.ConnectError:
        log.error("Cannot reach bridge at %s — is the backend running?", BRIDGE_BASE_URL)
        return None
    except Exception as e:
        log.error("Equity POST error: %s", e)
        return None


def post_trade_event(client: httpx.Client, payload: dict) -> Optional[dict]:
    """POST one trade event to the FastAPI bridge."""
    try:
        r = client.post(
            f"{BRIDGE_BASE_URL}/trading/mt5/bridge/trade",
            json=payload,
            headers={"X-MT5-Bridge-Secret": BRIDGE_SECRET},
            timeout=8,
        )
        if r.status_code == 200:
            return r.json()
        else:
            log.warning("Bridge trade error %s: %s", r.status_code, r.text[:120])
            return None
    except Exception as e:
        log.error("Trade POST error: %s", e)
        return None


# ─────────────────────────────────────────────────────────────────────────────
# Main polling loop
# ─────────────────────────────────────────────────────────────────────────────

def run_sweep(client: httpx.Client, mt5_ready: bool) -> None:
    """
    One full sweep: iterate all active accounts, read MT5, post to bridge.
    """
    accounts = get_active_accounts()

    if not accounts:
        log.info("No active MT5 accounts found in database.")
        return

    log.info("-- Sweep started -- %d account(s) to poll", len(accounts))

    for acct in accounts:
        login    = acct["mt5_login"]
        password = acct["mt5_password"]
        server   = acct["mt5_server"]

        # ── Step 1: Login to this account in MT5 ──
        if mt5_ready:
            ok = mt5_login_account(login, password, server)
            if not ok:
                log.warning("  [%s] Skipping -- login failed", login)
                continue
            time.sleep(SWITCH_DELAY)   # brief pause after switching account

        # ── Step 2: Read equity snapshot ──
        snapshot = read_account_snapshot(login)
        if snapshot is None:
            log.warning("  [%s] No snapshot data returned", login)
            continue

        # ── Step 3: POST equity to bridge -> risk engine fires ──
        result = post_equity_tick(client, snapshot)
        if result:
            status      = result.get("status", "?")
            is_breached = result.get("is_breached", False)
            is_passed   = result.get("is_passed", False)
            daily_rem   = result.get("daily_loss_remaining_usd", 0)
            max_rem     = result.get("max_drawdown_remaining_usd", 0)

            flag = ""
            if is_breached:
                flag = "  [!] BREACHED"
                log.warning("🚨 [HARD RISK STOP] Account %s reached BREACH threshold! Flattening positions...", login)
                closed_cnt = close_all_open_positions(comment="MaxFunded Breach Stop")
                log.warning("🚨 [HARD RISK STOP] Closed %d open position(s) on %s", closed_cnt, login)
            elif is_passed:
                flag = "  [*] PASSED"
                log.info("🎉 [CHALLENGE PASSED] Account %s passed Phase Evaluation!", login)

            log.info(
                "  [%s] equity=%.2f  balance=%.2f  status=%s  "
                "daily_rem=$%.0f  max_rem=$%.0f%s",
                login,
                snapshot["current_equity"],
                snapshot.get("current_balance", 0),
                status,
                daily_rem,
                max_rem,
                flag,
            )
        else:
            # Bridge unreachable -- log locally anyway
            log.info(
                "  [%s] equity=%.2f (bridge offline -- not processed)",
                login,
                snapshot["current_equity"],
            )

        # ── Step 4 (optional): Send open position events ──
        if mt5_ready:
            positions = read_open_positions(login)
            for pos in positions:
                pos["mt5_login"] = login
                post_trade_event(client, pos)
            if positions:
                log.info("  [%s] Sent %d open position(s)", login, len(positions))

    log.info("-- Sweep done --")


def run_mirror_mode(client: httpx.Client, mt5_ready: bool, override_login: Optional[str] = None) -> None:
    """
    Live Terminal Mirror Mode:
    Directly reads whatever account is active in the running MT5 terminal.
    Zero login switches needed -- perfect for local demo trading & instant feedback!
    """
    if not mt5_ready:
        log.warning("MT5 terminal not connected. Running simulation tick.")
        snapshot = read_account_snapshot("8891024")
        if snapshot:
            post_equity_tick(client, snapshot)
        return

    info = mt5.account_info()
    if info is None:
        log.warning("MT5 terminal has no active account logged in. Please log in to an account in MT5.")
        return

    login = override_login or str(info.login)
    snapshot = {
        "mt5_login": login,
        "current_equity": float(info.equity),
        "current_balance": float(info.balance),
        "margin": float(info.margin),
        "free_margin": float(info.margin_free),
    }

    result = post_equity_tick(client, snapshot)
    if result:
        status      = result.get("status", "?")
        is_breached = result.get("is_breached", False)
        is_passed   = result.get("is_passed", False)
        daily_rem   = result.get("daily_loss_remaining_usd", 0)
        max_rem     = result.get("max_drawdown_remaining_usd", 0)

        flag = ""
        if is_breached:
            flag = "  [!] BREACHED"
            log.warning("🚨 [HARD RISK STOP] Account %s reached BREACH threshold! Flattening all open positions...", login)
            closed_cnt = close_all_open_positions(comment="MaxFunded Breach Stop")
            log.warning("🚨 [HARD RISK STOP] Closed %d open position(s) on %s", closed_cnt, login)
        elif is_passed:
            flag = "  [*] PASSED"
            log.info("🎉 [CHALLENGE PASSED] Account %s passed Phase Evaluation!", login)

        log.info(
            "  [MIRROR %s] equity=%.2f  balance=%.2f  status=%s  "
            "daily_rem=$%.0f  max_rem=$%.0f%s",
            login,
            snapshot["current_equity"],
            snapshot["current_balance"],
            status,
            daily_rem,
            max_rem,
            flag,
        )
    else:
        log.info("  [MIRROR %s] equity=%.2f (synced)", login, snapshot["current_equity"])

    # Stream open positions
    positions = read_open_positions(login)
    for pos in positions:
        pos["mt5_login"] = login
        post_trade_event(client, pos)
    if positions:
        log.info("  [MIRROR %s] Synced %d open position(s)", login, len(positions))


def main():
    global BRIDGE_BASE_URL, BRIDGE_SECRET
    parser = argparse.ArgumentParser(description="MaxFunded MT5 Python Poller")
    parser.add_argument("--interval", type=int, default=POLL_INTERVAL, help="Poll interval in seconds (default 5)")
    parser.add_argument("--once", action="store_true", help="Run one sweep then exit")
    parser.add_argument("--mirror", action="store_true", default=True, help="Mirror the currently active MT5 terminal account (default)")
    parser.add_argument("--multi", action="store_true", help="Switch across all active database accounts")
    parser.add_argument("--login-map", type=str, default=None, help="Map MT5 terminal login to a specific database login (e.g. 8891024)")
    parser.add_argument("--bridge-url", type=str, default=BRIDGE_BASE_URL, help="FastAPI bridge base URL")
    parser.add_argument("--bridge-secret", type=str, default=BRIDGE_SECRET, help="Bridge secret key")
    parser.add_argument("--terminal-path", type=str, default=None, help="Custom path to terminal64.exe")
    args = parser.parse_args()

    BRIDGE_BASE_URL = args.bridge_url
    BRIDGE_SECRET   = args.bridge_secret
    use_multi       = args.multi

    print("\n" + "=" * 60)
    print("  MaxFunded MT5 Poller Service")
    print(f"  Mode          : {'Multi-Account Sweep' if use_multi else 'Live Terminal Mirror'}")
    print(f"  Bridge URL    : {BRIDGE_BASE_URL}")
    print(f"  Interval      : {args.interval}s")
    print(f"  Terminal Path : {args.terminal_path or 'Auto-detect'}")
    print(f"  MT5 Lib       : {'Available [OK]' if MT5_AVAILABLE else 'Not installed -- SIMULATION MODE [!]'}")
    print(f"  Database      : {'Connected [OK]' if DB_AVAILABLE else 'Unavailable -- demo fallback [!]'}")
    print("=" * 60 + "\n")

    # Initialize MT5 terminal connection
    mt5_ready = False
    if MT5_AVAILABLE:
        mt5_ready = mt5_init(path=args.terminal_path)
        if not mt5_ready:
            log.warning("MT5 terminal not reachable -- running in SIMULATION MODE")
    else:
        log.warning("Running in SIMULATION MODE (install MetaTrader5 to go live)")

    with httpx.Client() as client:
        step_fn = (lambda: run_sweep(client, mt5_ready)) if use_multi else (lambda: run_mirror_mode(client, mt5_ready, args.login_map))
        if args.once:
            step_fn()
        else:
            log.info("Poller running. Press Ctrl+C to stop.")
            while True:
                try:
                    step_fn()
                except KeyboardInterrupt:
                    log.info("Poller stopped by user.")
                    break
                except Exception as e:
                    log.error("Unexpected error in poll: %s -- retrying in %ds", e, args.interval)

                time.sleep(args.interval)

    if MT5_AVAILABLE and mt5_ready:
        mt5.shutdown()
        log.info("MT5 connection closed.")


if __name__ == "__main__":
    main()

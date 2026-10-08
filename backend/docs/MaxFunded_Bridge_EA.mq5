//+------------------------------------------------------------------+
//|  MaxFunded Bridge EA — MT5 Expert Advisor                        |
//|  Connects your MT5 account to the MaxFunded platform             |
//|  Sends every trade and equity tick to the Risk Engine            |
//+------------------------------------------------------------------+
//
//  SETUP INSTRUCTIONS
//  ------------------
//  1. Copy this file into: <MT5 Data Folder>/MQL5/Experts/
//  2. In MT5 → Tools → Options → Expert Advisors:
//       ✓ Allow Automated Trading
//       ✓ Allow WebRequest for the following URLs:
//         http://localhost:8000   (dev)
//         https://api.maxfunded.com  (production)
//  3. Attach this EA to ANY chart (e.g. EURUSD M1)
//  4. Fill in your MT5 Login and the Bridge Secret below
//  5. Press F5 to compile (no errors = ready)
//
//+------------------------------------------------------------------+

#property copyright "MaxFunded Trading Technologies"
#property version   "1.0"
#property strict

//--- Input Parameters (set these in the EA properties panel)
input string   BridgeURL       = "http://localhost:8000/api/v1/trading/mt5/bridge";
input string   BridgeSecret    = "change-me-in-production-32chars";   // Must match MT5_BRIDGE_SECRET in .env
input string   AccountLogin    = "";      // Your MaxFunded MT5 login (e.g. 8812345)
input int      EquityTickSecs  = 5;       // How often to send equity ticks (seconds)
input bool     EnableLogging   = true;    // Print logs to Experts tab

//--- Internal state
datetime lastEquityTick = 0;
int      lastKnownDeals = 0;

//+------------------------------------------------------------------+
//| EA Initialization                                                 |
//+------------------------------------------------------------------+
int OnInit()
{
   if(AccountLogin == "")
   {
      Print("[MaxFunded EA] ERROR: AccountLogin not set. Enter your MT5 login in EA settings.");
      return INIT_PARAMETERS_INCORRECT;
   }

   if(BridgeSecret == "change-me-in-production-32chars")
      Print("[MaxFunded EA] WARNING: Using default bridge secret. Change this in production!");

   Print("[MaxFunded EA] Initialized. Login=", AccountLogin,
         " | Bridge=", BridgeURL,
         " | Equity tick every ", EquityTickSecs, "s");
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Called on every tick                                              |
//+------------------------------------------------------------------+
void OnTick()
{
   // 1. Send equity tick on schedule
   if(TimeCurrent() - lastEquityTick >= EquityTickSecs)
   {
      SendEquityTick();
      lastEquityTick = TimeCurrent();
   }

   // 2. Check for new closed deals
   int totalDeals = HistoryDealsTotal();
   if(totalDeals > lastKnownDeals)
   {
      // Select history for last 24 hours to find new deals
      HistorySelect(TimeCurrent() - 86400, TimeCurrent());
      totalDeals = HistoryDealsTotal();

      for(int i = lastKnownDeals; i < totalDeals; i++)
      {
         ulong ticket = HistoryDealGetTicket(i);
         if(ticket == 0) continue;

         ENUM_DEAL_ENTRY entry = (ENUM_DEAL_ENTRY)HistoryDealGetInteger(ticket, DEAL_ENTRY);
         // Only report closed (OUT) deals
         if(entry != DEAL_ENTRY_OUT) continue;

         SendTradeEvent(ticket);
      }
      lastKnownDeals = totalDeals;
   }
}

//+------------------------------------------------------------------+
//| Send a completed trade event to the MaxFunded bridge             |
//+------------------------------------------------------------------+
void SendTradeEvent(ulong ticket)
{
   string symbol    = HistoryDealGetString(ticket,  DEAL_SYMBOL);
   double profit    = HistoryDealGetDouble(ticket,  DEAL_PROFIT);
   double commission= HistoryDealGetDouble(ticket,  DEAL_COMMISSION);
   double swap      = HistoryDealGetDouble(ticket,  DEAL_SWAP);
   double volume    = HistoryDealGetDouble(ticket,  DEAL_VOLUME);
   double price     = HistoryDealGetDouble(ticket,  DEAL_PRICE);
   int    dealType  = (int)HistoryDealGetInteger(ticket, DEAL_TYPE);
   string tradeType = (dealType == DEAL_TYPE_BUY) ? "BUY" : "SELL";

   string json = StringFormat(
      "{"
      "\"mt5_login\":\"%s\","
      "\"ticket\":\"%I64u\","
      "\"symbol\":\"%s\","
      "\"trade_type\":\"%s\","
      "\"lots\":%.2f,"
      "\"open_price\":%.5f,"
      "\"close_price\":%.5f,"
      "\"profit\":%.2f,"
      "\"commission\":%.2f,"
      "\"swap\":%.2f,"
      "\"current_balance\":%.2f,"
      "\"current_equity\":%.2f,"
      "\"status\":\"CLOSED\""
      "}",
      AccountLogin,
      ticket,
      symbol,
      tradeType,
      volume,
      price,       // NOTE: open_price not directly in deal history; use for demo
      price,
      profit,
      commission,
      swap,
      AccountInfoDouble(ACCOUNT_BALANCE),
      AccountInfoDouble(ACCOUNT_EQUITY)
   );

   string url     = BridgeURL + "/trade";
   string headers = "Content-Type: application/json\r\nX-MT5-Bridge-Secret: " + BridgeSecret;
   char   body[], response[];
   string responseHeaders;

   StringToCharArray(json, body, 0, StringLen(json));

   int res = WebRequest("POST", url, headers, 5000, body, response, responseHeaders);

   if(EnableLogging)
   {
      if(res == 200)
         Print("[MaxFunded EA] Trade sent OK — ticket=", ticket, " profit=", profit);
      else
         Print("[MaxFunded EA] Trade send FAILED — HTTP ", res, " ticket=", ticket);
   }

   // Parse response — if trading_locked=true, alert the trader
   if(res == 200)
   {
      string resp = CharArrayToString(response);
      if(StringFind(resp, "\"trading_locked\":true") >= 0)
      {
         Alert("[MaxFunded] ⚠️ TRADING LOCKED — Risk limit breached! No new positions allowed.");
         Print("[MaxFunded EA] TRADING LOCKED by risk engine. Response: ", resp);
      }
   }
}

//+------------------------------------------------------------------+
//| Send floating equity tick to the MaxFunded bridge                |
//+------------------------------------------------------------------+
void SendEquityTick()
{
   string json = StringFormat(
      "{"
      "\"mt5_login\":\"%s\","
      "\"current_equity\":%.2f,"
      "\"current_balance\":%.2f"
      "}",
      AccountLogin,
      AccountInfoDouble(ACCOUNT_EQUITY),
      AccountInfoDouble(ACCOUNT_BALANCE)
   );

   string url     = BridgeURL + "/equity";
   string headers = "Content-Type: application/json\r\nX-MT5-Bridge-Secret: " + BridgeSecret;
   char   body[], response[];
   string responseHeaders;

   StringToCharArray(json, body, 0, StringLen(json));

   int res = WebRequest("POST", url, headers, 3000, body, response, responseHeaders);

   if(EnableLogging && res != 200)
      Print("[MaxFunded EA] Equity tick FAILED — HTTP ", res);

   // Lock alert on equity breach
   if(res == 200)
   {
      string resp = CharArrayToString(response);
      if(StringFind(resp, "\"trading_locked\":true") >= 0)
      {
         Alert("[MaxFunded] ⚠️ TRADING LOCKED — Drawdown limit breached on live equity!");
         ExpertRemove(); // Self-remove EA to prevent further trades
      }
   }
}

//+------------------------------------------------------------------+
//| Cleanup                                                           |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   Print("[MaxFunded EA] Deinitialized. Reason code: ", reason);
}

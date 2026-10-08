"""
MaxFunded Transactional Email Service.

Provides async, responsive HTML email delivery for:
- Challenge confirmation & MT5 credentials delivery (with server, login, passwords)
- Rule breach notifications (Daily drawdown / Max loss alerts)
- Phase passed & Certificate notifications
- Payout confirmations

Uses Python's standard smtplib executed in an async thread pool to prevent blocking.
If SMTP_HOST is not configured, gracefully falls back to structured console/debug logging.
"""

import asyncio
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from app.core.config import settings

logger = logging.getLogger("maxfunded.email")


class EmailService:
    @staticmethod
    def _render_base_template(title: str, body_html: str) -> str:
        """Standard responsive MaxFunded dark-mode template with neon lime accents."""
        return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: #080c14;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
    }}
    .wrapper {{
      width: 100%;
      background-color: #080c14;
      padding: 30px 10px;
    }}
    .container {{
      max-width: 600px;
      margin: 0 auto;
      background-color: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }}
    .header {{
      background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
      padding: 24px 32px;
      border-bottom: 1px solid #334155;
      text-align: center;
    }}
    .brand {{
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
      text-transform: uppercase;
    }}
    .brand span {{
      color: #ccff00;
    }}
    .content {{
      padding: 32px;
    }}
    .credential-box {{
      background-color: #030712;
      border: 1px solid #1f2937;
      border-left: 4px solid #ccff00;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
    }}
    .credential-row {{
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #111827;
      font-size: 14px;
    }}
    .credential-row:last-child {{
      border-bottom: none;
    }}
    .label {{
      color: #94a3b8;
    }}
    .value {{
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      color: #f8fafc;
      font-weight: 600;
      letter-spacing: 0.5px;
    }}
    .btn {{
      display: inline-block;
      background-color: #ccff00;
      color: #000000 !important;
      font-weight: 700;
      font-size: 15px;
      padding: 14px 28px;
      border-radius: 8px;
      text-decoration: none;
      text-align: center;
      margin: 20px 0;
    }}
    .footer {{
      padding: 24px 32px;
      background-color: #030712;
      border-top: 1px solid #1f2937;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }}
    .footer a {{
      color: #94a3b8;
      text-decoration: underline;
    }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="brand">MAX<span>FUNDED</span></div>
      </div>
      <div class="content">
        {body_html}
      </div>
      <div class="footer">
        <div style="margin-bottom: 14px;">
          <a href="https://discord.gg/maxfunded" style="color: #858df9; margin: 0 10px; font-weight: bold; text-decoration: none; font-size: 13px;">Discord Floor</a> &bull;
          <a href="https://t.me/maxfunded" style="color: #7bd2f7; margin: 0 10px; font-weight: bold; text-decoration: none; font-size: 13px;">Telegram Desk</a> &bull;
          <a href="https://x.com/maxfunded" style="color: #ffffff; margin: 0 10px; font-weight: bold; text-decoration: none; font-size: 13px;">X / Twitter</a> &bull;
          <a href="https://youtube.com/@maxfunded" style="color: #ff4d4d; margin: 0 10px; font-weight: bold; text-decoration: none; font-size: 13px;">YouTube</a>
        </div>
        <p>&copy; 2026 MaxFunded Proprietary Trading Technologies Ltd. All rights reserved.</p>
        <p>This is an automated operational notification. Never share your master password with anyone.</p>
      </div>
    </div>
  </div>
</body>
</html>"""

    async def _send_mail(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        plain_text: Optional[str] = None,
    ) -> bool:
        """
        Sends email via configured SMTP in a non-blocking background thread.
        If SMTP is unconfigured, logs the full email payload for review.
        """
        smtp_host = getattr(settings, "SMTP_HOST", "")
        if not smtp_host:
            logger.info(
                "[MOCK EMAIL DISPATCH] Recipient: %s | Subject: %s | (Configure SMTP in .env to deliver live)",
                to_email,
                subject,
            )
            return True

        def _sync_send():
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
            msg["To"] = to_email

            if plain_text:
                msg.attach(MIMEText(plain_text, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                if settings.SMTP_TLS:
                    server.starttls()
                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_FROM_EMAIL, [to_email], msg.as_string())

        try:
            await asyncio.to_thread(_sync_send)
            logger.info("Successfully sent transactional email to %s: '%s'", to_email, subject)
            return True
        except Exception as exc:
            logger.exception("Failed to send transactional email to %s: %s", to_email, exc)
            return False

    async def send_credentials_email(
        self,
        to_email: str,
        trader_name: str,
        challenge_name: str,
        starting_balance: float,
        mt5_login: str,
        mt5_password: str,
        mt5_investor_password: str,
        mt5_server: str,
    ) -> bool:
        """Dispatches trading account credentials upon payment confirmation."""
        subject = f"Your MaxFunded MT5 Credentials — {challenge_name} (${starting_balance:,.0f})"
        
        body_html = f"""
        <h2 style="color: #ffffff; margin-top: 0;">Welcome to MaxFunded, {trader_name}!</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
          Your payment has been confirmed and your evaluation account is now active.
          Here are your official MetaTrader 5 trading credentials:
        </p>

        <div class="credential-box">
          <div style="font-size: 11px; text-transform: uppercase; color: #ccff00; font-weight: bold; letter-spacing: 1px; margin-bottom: 12px;">
            ACCOUNT CREDENTIALS (MT5)
          </div>
          <div class="credential-row">
            <span class="label">Server:</span>
            <span class="value">{mt5_server}</span>
          </div>
          <div class="credential-row">
            <span class="label">Login / Account ID:</span>
            <span class="value">{mt5_login}</span>
          </div>
          <div class="credential-row">
            <span class="label">Master Password:</span>
            <span class="value">{mt5_password}</span>
          </div>
          <div class="credential-row">
            <span class="label">Investor (Read-Only) Password:</span>
            <span class="value">{mt5_investor_password}</span>
          </div>
          <div class="credential-row">
            <span class="label">Initial Balance:</span>
            <span class="value">${starting_balance:,.2f} USD</span>
          </div>
        </div>

        <h3 style="color: #ffffff; font-size: 16px;">Quick Setup Guide</h3>
        <ol style="color: #94a3b8; font-size: 14px; line-height: 1.7; padding-left: 20px;">
          <li>Open MetaTrader 5 on your PC, iPhone, or Android device.</li>
          <li>Go to <strong>File &rarr; Login to Trade Account</strong>.</li>
          <li>Enter the <strong>Login</strong>, <strong>Password</strong>, and select or type Server <strong>{mt5_server}</strong>.</li>
          <li>Track your real-time drawdown, high-water mark, and profit targets live on your MaxFunded Dashboard.</li>
        </ol>

        <div style="text-align: center;">
          <a href="{settings.FRONTEND_URL}/dashboard" class="btn">Launch Trader Dashboard &rarr;</a>
        </div>

        <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
          <strong>Risk Reminder:</strong> Keep your daily loss below 5% and overall drawdown below 10%. Trade at your own pace — there is no minimum time limit.
        </p>
        """

        full_html = self._render_base_template(subject, body_html)
        return await self._send_mail(to_email, subject, full_html)

    async def send_breach_alert_email(
        self,
        to_email: str,
        trader_name: str,
        challenge_name: str,
        mt5_login: str,
        rule_name: str,
        breached_value: float,
        threshold_value: float,
        details: Optional[str] = None,
    ) -> bool:
        """Dispatches an alert when an account breaches risk engine thresholds."""
        subject = f"Account Alert: Risk Threshold Reached on Account {mt5_login}"

        body_html = f"""
        <h2 style="color: #ef4444; margin-top: 0;">Evaluation Risk Threshold Exceeded</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
          Hello {trader_name}, our automated risk management engine detected that account <strong>{mt5_login}</strong> has exceeded an evaluation boundary.
        </p>

        <div style="background-color: #1c0b0b; border: 1px solid #7f1d1d; border-left: 4px solid #ef4444; border-radius: 8px; padding: 18px; margin: 20px 0;">
          <div style="color: #fca5a5; font-weight: bold; margin-bottom: 8px;">RULE BREACHED: {rule_name}</div>
          <div style="font-size: 14px; color: #e2e8f0; line-height: 1.6;">
            Recorded Loss / Metric: <strong>${breached_value:,.2f}</strong><br>
            Permitted Limit: <strong>${threshold_value:,.2f}</strong><br>
            {f"Details: {details}" if details else ""}
          </div>
        </div>

        <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
          Trading on this account has been paused to protect capital according to platform rules. You can review the exact audit logs and metrics on your dashboard.
        </p>

        <div style="text-align: center;">
          <a href="{settings.FRONTEND_URL}/dashboard" class="btn" style="background-color: #ef4444; color: #ffffff !important;">View Account Breakdown</a>
        </div>
        """

        full_html = self._render_base_template(subject, body_html)
        return await self._send_mail(to_email, subject, full_html)

    async def send_phase_passed_email(
        self,
        to_email: str,
        trader_name: str,
        challenge_name: str,
        mt5_login: str,
        certificate_code: Optional[str] = None,
    ) -> bool:
        """Dispatches congratulations when a trader passes Phase 1, Phase 2, or is Funded."""
        subject = f"Congratulations {trader_name}! You Have Passed Your Evaluation"

        cert_link = (
            f"{settings.FRONTEND_URL}/verify/{certificate_code}"
            if certificate_code
            else f"{settings.FRONTEND_URL}/dashboard"
        )

        body_html = f"""
        <h2 style="color: #ccff00; margin-top: 0;">Evaluation Target Achieved!</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
          Outstanding trading, {trader_name}! You have met all profit requirements on account <strong>{mt5_login}</strong> ({challenge_name}) without violating any daily loss or max drawdown rules.
        </p>

        <div style="background-color: #030712; border: 1px solid #14532d; border-left: 4px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <div style="font-size: 12px; color: #34d399; font-weight: bold; text-transform: uppercase;">STATUS: PASSED & VERIFIED</div>
          <p style="font-size: 14px; color: #e2e8f0; margin: 8px 0 0 0;">
            Your cryptographic certificate of achievement has been generated on the platform.
          </p>
        </div>

        <div style="text-align: center;">
          <a href="{cert_link}" class="btn">View Certificate & Next Steps &rarr;</a>
        </div>
        """

        full_html = self._render_base_template(subject, body_html)
        return await self._send_mail(to_email, subject, full_html)

    async def send_welcome_email(self, to_email: str, trader_name: str) -> bool:
        """Dispatches a welcome email upon successful user registration."""
        subject = "Welcome to MaxFunded — Your Trading Journey Starts Now"
        body_html = f"""
        <h2 style="color: #ccff00; margin-top: 0;">Welcome aboard, {trader_name}!</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
          Your MaxFunded account has been created successfully. You're one step away from accessing 
          institutional-grade funded trading.
        </p>
        <div style="background-color: #0d0e10; border: 1px solid #1e2a1a; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <div style="font-size: 12px; color: #ccff00; font-weight: bold; text-transform: uppercase; margin-bottom: 12px;">NEXT STEPS</div>
          <ol style="color: #94a3b8; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">
            <li>Browse our evaluation challenges and pick your account size</li>
            <li>Complete your KYC verification (required for payouts)</li>
            <li>Fund your challenge and receive your MT5 credentials instantly</li>
            <li>Hit the profit target, get funded, and withdraw up to 90% profits</li>
          </ol>
        </div>
        <div style="text-align: center;">
          <a href="{settings.FRONTEND_URL}/challenges" class="btn">Browse Challenges &rarr;</a>
        </div>
        """
        full_html = self._render_base_template(subject, body_html)
        return await self._send_mail(to_email, subject, full_html)

    async def send_password_reset_email(self, to_email: str, trader_name: str, reset_link: str) -> bool:
        """Dispatches a password reset link."""
        subject = "MaxFunded — Password Reset Request"
        body_html = f"""
        <h2 style="color: #ffffff; margin-top: 0;">Password Reset Request</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
          Hello {trader_name}, we received a request to reset the password for your MaxFunded account.
          Click the button below to set a new password.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{reset_link}" class="btn">Reset My Password &rarr;</a>
        </div>
        <p style="font-size: 13px; color: #64748b; line-height: 1.6;">
          This link expires in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email — your account remains secure.
        </p>
        <p style="font-size: 12px; color: #475569;">Or copy and paste this link: {reset_link}</p>
        """
        full_html = self._render_base_template(subject, body_html)
        return await self._send_mail(to_email, subject, full_html)

    async def send_payout_approved_email(self, to_email: str, trader_name: str, amount_usd: float, method: str, reference: str) -> bool:
        """Dispatches confirmation when a trader payout is approved."""
        subject = f"Payout Approved — ${amount_usd:,.2f} USD is on its way!"
        body_html = f"""
        <h2 style="color: #ccff00; margin-top: 0;">Your Payout Has Been Approved! 🎉</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
          Great news, {trader_name}! Your payout request has been reviewed and approved by our finance desk.
        </p>
        <div style="background-color: #030712; border: 1px solid #14532d; border-left: 4px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <div style="font-size: 12px; color: #34d399; font-weight: bold; text-transform: uppercase; margin-bottom: 12px;">PAYOUT DETAILS</div>
          <div style="font-size: 14px; color: #e2e8f0; line-height: 2;">
            Amount: <strong style="color: #ccff00;">${amount_usd:,.2f} USD</strong><br>
            Method: <strong>{method}</strong><br>
            Reference: <strong>{reference}</strong>
          </div>
        </div>
        <p style="font-size: 14px; color: #94a3b8;">Funds are typically received within 1-3 business days depending on network or banking rail.</p>
        <div style="text-align: center;">
          <a href="{settings.FRONTEND_URL}/payouts" class="btn">View Payout History &rarr;</a>
        </div>
        """
        full_html = self._render_base_template(subject, body_html)
        return await self._send_mail(to_email, subject, full_html)

    async def send_payout_rejected_email(self, to_email: str, trader_name: str, amount_usd: float, reason: str) -> bool:
        """Dispatches an alert when a payout request is rejected."""
        subject = "Payout Request Update — Action Required"
        body_html = f"""
        <h2 style="color: #ef4444; margin-top: 0;">Payout Request Could Not Be Processed</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
          Hello {trader_name}, unfortunately your payout request for <strong>${amount_usd:,.2f} USD</strong> could not be approved at this time.
        </p>
        <div style="background-color: #1c0b0b; border: 1px solid #7f1d1d; border-left: 4px solid #ef4444; border-radius: 8px; padding: 18px; margin: 20px 0;">
          <div style="color: #fca5a5; font-weight: bold; margin-bottom: 8px;">REASON</div>
          <div style="font-size: 14px; color: #e2e8f0;">{reason}</div>
        </div>
        <p style="font-size: 14px; color: #94a3b8;">Please resolve the issue and resubmit your payout request, or contact our support team.</p>
        <div style="text-align: center;">
          <a href="{settings.FRONTEND_URL}/payouts" class="btn" style="background-color: #ef4444;">View Payout Details &rarr;</a>
        </div>
        """
        full_html = self._render_base_template(subject, body_html)
        return await self._send_mail(to_email, subject, full_html)

    async def send_kyc_approved_email(self, to_email: str, trader_name: str) -> bool:
        """Dispatches KYC approval notification."""
        subject = "KYC Verified — You're Fully Verified on MaxFunded"
        body_html = f"""
        <h2 style="color: #ccff00; margin-top: 0;">Identity Verified ✅</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
          Congratulations {trader_name}! Your KYC (Know Your Customer) verification has been approved. Your account is now fully verified and eligible for unlimited profit payouts.
        </p>
        <div style="text-align: center;">
          <a href="{settings.FRONTEND_URL}/dashboard" class="btn">Go to Dashboard &rarr;</a>
        </div>
        """
        full_html = self._render_base_template(subject, body_html)
        return await self._send_mail(to_email, subject, full_html)

    async def send_kyc_rejected_email(self, to_email: str, trader_name: str, reason: str) -> bool:
        """Dispatches KYC rejection notification."""
        subject = "KYC Verification — Resubmission Required"
        body_html = f"""
        <h2 style="color: #f59e0b; margin-top: 0;">KYC Document Review Update</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
          Hello {trader_name}, our compliance team has reviewed your submitted documents and requires resubmission.
        </p>
        <div style="background-color: #1c1208; border: 1px solid #78350f; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 18px; margin: 20px 0;">
          <div style="color: #fbbf24; font-weight: bold; margin-bottom: 8px;">REASON FOR REJECTION</div>
          <div style="font-size: 14px; color: #e2e8f0;">{reason}</div>
        </div>
        <p style="font-size: 14px; color: #94a3b8;">Please resubmit clear, valid government identification documents to complete verification.</p>
        <div style="text-align: center;">
          <a href="{settings.FRONTEND_URL}/kyc" class="btn" style="background-color: #f59e0b; color: #000;">Resubmit Documents &rarr;</a>
        </div>
        """
        full_html = self._render_base_template(subject, body_html)
        return await self._send_mail(to_email, subject, full_html)


email_service = EmailService()

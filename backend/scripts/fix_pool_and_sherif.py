import sqlite3, sys, os, smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

db = r"C:\Users\DATA ENG. OLA\Desktop\PROP FIRM ME\backend\riffmax.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

# Step 1: Delete all old dummy seed accounts from pool
old_logins = ('6011001','6011002','6025001','6025002','6050001','6050002','6100001','6100002','6200001')
cur.execute(f"DELETE FROM mt5_account_pool WHERE mt5_login IN ({','.join('?'*len(old_logins))})", old_logins)
print(f"[1] Deleted {cur.rowcount} old dummy pool accounts")

# Step 2: Fix Sherif's purchase record
cur.execute("""
    UPDATE challenge_purchases 
    SET mt5_login='68518249', mt5_password='Iamgreat@2030', mt5_investor_password='', mt5_server='RoboForex-Demo'
    WHERE mt5_login='6100002'
""")
print(f"[2] Updated {cur.rowcount} purchase record(s) to correct RoboForex login")

# Step 3: Mark 68518249 as ASSIGNED in pool
cur.execute("UPDATE mt5_account_pool SET status='ASSIGNED' WHERE mt5_login='68518249'")
print(f"[3] Marked 68518249 as ASSIGNED in pool")

conn.commit()

# Verify pool state
cur.execute("SELECT mt5_login, mt5_password, account_tier, status FROM mt5_account_pool ORDER BY created_at")
rows = cur.fetchall()
print("\n=== POOL STATE AFTER CLEANUP ===")
for r in rows:
    print(f"  Login: {r[0]} | Pass: {r[1]} | Tier: {r[2]} | Status: {r[3]}")

# Verify Sherif's record
cur.execute("""SELECT u.email, u.full_name, cp.mt5_login, cp.mt5_password, cp.mt5_server 
             FROM challenge_purchases cp 
             JOIN users u ON cp.user_id=u.id 
             WHERE cp.mt5_login='68518249'""")
rows = cur.fetchall()
print("\n=== SHERIF'S PURCHASE RECORD ===")
sherif_data = None
for r in rows:
    print(f"  Email: {r[0]} | Name: {r[1]} | MT5 Login: {r[2]} | Password: {r[3]} | Server: {r[4]}")
    sherif_data = r

conn.close()

if not sherif_data:
    print("\nERROR: Could not find Sherif's purchase record!")
    sys.exit(1)

# Step 4: Resend correct credentials email
email_to = sherif_data[0]
full_name = sherif_data[1]
mt5_login = sherif_data[2]
mt5_password = sherif_data[3]
mt5_server = sherif_data[4]

SMTP_USER = "sherifolaide2030@gmail.com"
SMTP_PASS = "kfcxeikgewgrkjyt"

html = f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#08090b;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#08090b;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#0d0e10;border:1px solid #1e2130;border-radius:16px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0d0e10 0%,#111418 100%);padding:40px 40px 30px;border-bottom:1px solid #1e2130;text-align:center;">
            <div style="display:inline-block;background:#ccff00;color:#000;font-weight:900;font-size:11px;letter-spacing:3px;padding:4px 12px;border-radius:20px;text-transform:uppercase;margin-bottom:16px;">MaxFunded</div>
            <h1 style="color:#ffffff;font-size:28px;font-weight:800;margin:0 0 8px;">Your MT5 Account is Ready</h1>
            <p style="color:#6b7280;font-size:15px;margin:0;">Welcome to the MaxFunded community, {full_name}!</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 28px;">
              Hi <strong style="color:#ffffff;">{full_name}</strong>,<br><br>
              Your <strong style="color:#ccff00;">$100,000 Evaluation Account</strong> has been provisioned and is ready to trade.
              Log in to MetaTrader 5 using the credentials below.
            </p>
            <!-- Credentials Box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#111418;border:1px solid #1e2130;border-radius:12px;margin-bottom:28px;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="color:#6b7280;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 20px;">MT5 Login Credentials</p>
                  <table width="100%">
                    <tr>
                      <td style="padding:10px 0;border-bottom:1px solid #1e2130;">
                        <span style="color:#6b7280;font-size:13px;">Platform</span>
                        <span style="color:#ffffff;font-size:14px;font-weight:700;float:right;">MetaTrader 5</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;border-bottom:1px solid #1e2130;">
                        <span style="color:#6b7280;font-size:13px;">Login ID</span>
                        <span style="color:#ccff00;font-size:18px;font-weight:900;float:right;">{mt5_login}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;border-bottom:1px solid #1e2130;">
                        <span style="color:#6b7280;font-size:13px;">Password</span>
                        <span style="color:#ffffff;font-size:14px;font-weight:700;float:right;font-family:monospace;">{mt5_password}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;">
                        <span style="color:#6b7280;font-size:13px;">Server</span>
                        <span style="color:#ffffff;font-size:14px;font-weight:700;float:right;">{mt5_server}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <!-- Account Info -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td width="48%" style="background:#111418;border:1px solid #1e2130;border-radius:10px;padding:16px 20px;">
                  <p style="color:#6b7280;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;">Account Size</p>
                  <p style="color:#ccff00;font-size:22px;font-weight:900;margin:0;">$100,000</p>
                </td>
                <td width="4%"></td>
                <td width="48%" style="background:#111418;border:1px solid #1e2130;border-radius:10px;padding:16px 20px;">
                  <p style="color:#6b7280;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;">Profit Split</p>
                  <p style="color:#ffffff;font-size:22px;font-weight:900;margin:0;">Up to 90%</p>
                </td>
              </tr>
            </table>
            <!-- Dashboard CTA -->
            <div style="text-align:center;margin-bottom:28px;">
              <a href="http://localhost:3000/dashboard" style="display:inline-block;background:#ccff00;color:#000;font-weight:900;font-size:15px;padding:14px 36px;border-radius:10px;text-decoration:none;letter-spacing:0.5px;">View Your Dashboard &rarr;</a>
            </div>
            <!-- Rules reminder -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1a;border:1px solid #1e2a3a;border-radius:10px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="color:#60a5fa;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 12px;">Challenge Rules</p>
                  <p style="color:#6b7280;font-size:13px;margin:4px 0;">&#10003;&nbsp; Daily Loss Limit: <strong style="color:#e5e7eb;">4%</strong></p>
                  <p style="color:#6b7280;font-size:13px;margin:4px 0;">&#10003;&nbsp; Max Drawdown: <strong style="color:#e5e7eb;">8%</strong></p>
                  <p style="color:#6b7280;font-size:13px;margin:4px 0;">&#10003;&nbsp; Profit Target (Phase 1): <strong style="color:#e5e7eb;">8%</strong></p>
                  <p style="color:#6b7280;font-size:13px;margin:4px 0;">&#10003;&nbsp; No weekend/news holding restrictions</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #1e2130;text-align:center;">
            <p style="color:#374151;font-size:12px;margin:0;">MaxFunded &mdash; Prop Trading Done Right</p>
            <p style="color:#374151;font-size:11px;margin:8px 0 0;">Questions? Reply to this email or visit your dashboard.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
"""

msg = MIMEMultipart('alternative')
msg['Subject'] = f"[MaxFunded] Your $100K MT5 Account is Ready - Login: {mt5_login}"
msg['From'] = f"MaxFunded <{SMTP_USER}>"
msg['To'] = email_to

msg.attach(MIMEText(html, 'html'))

print(f"\n[4] Sending corrected credentials email to {email_to}...")
try:
    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.ehlo()
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, email_to, msg.as_string())
    print(f"[4] Email sent successfully to {email_to}!")
    print(f"\n=== DONE ===")
    print(f"MT5 Login: {mt5_login}")
    print(f"MT5 Password: {mt5_password}")
    print(f"MT5 Server: {mt5_server}")
    print(f"Email dispatched to: {email_to}")
except Exception as e:
    print(f"[4] Email error: {e}")
    sys.exit(1)

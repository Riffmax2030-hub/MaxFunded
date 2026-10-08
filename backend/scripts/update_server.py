import sqlite3
conn = sqlite3.connect('riffmax.db')
cur = conn.cursor()

cur.execute("UPDATE mt5_account_pool SET server_name='RoboForex-Pro' WHERE server_name='RoboForex-Demo'")
print(f"Pool accounts updated: {cur.rowcount}")

cur.execute("UPDATE challenge_purchases SET mt5_server='RoboForex-Pro' WHERE mt5_server='RoboForex-Demo'")
print(f"Purchase records updated: {cur.rowcount}")

conn.commit()

cur.execute("SELECT mt5_login, server_name, account_tier, status FROM mt5_account_pool")
print("\n=== POOL AFTER UPDATE ===")
for r in cur.fetchall():
    print(f"  {r[0]} | Server: {r[1]} | Tier: {r[2]} | {r[3]}")

conn.close()
print("\nDone.")

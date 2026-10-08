import sqlite3

conn = sqlite3.connect('riffmax.db')
cur = conn.cursor()

# Show what's being removed
cur.execute("SELECT mt5_login, server_name, account_tier, status FROM mt5_account_pool")
rows = cur.fetchall()
print("=== REMOVING FROM POOL ===")
for r in rows:
    print(f"  Login: {r[0]} | Server: {r[1]} | Tier: {r[2]} | Status: {r[3]}")

# Delete all pool accounts
cur.execute("DELETE FROM mt5_account_pool")
print(f"\nDeleted {cur.rowcount} account(s) from pool.")

conn.commit()

# Verify pool is empty
cur.execute("SELECT COUNT(*) FROM mt5_account_pool")
count = cur.fetchone()[0]
print(f"Pool is now empty: {count} accounts remaining.")

# Show Sherif's purchase record is still intact
cur.execute("""SELECT u.email, u.full_name, cp.mt5_login, cp.mt5_password, cp.mt5_server 
             FROM challenge_purchases cp 
             JOIN users u ON cp.user_id=u.id 
             WHERE cp.mt5_login='68518249'""")
row = cur.fetchone()
if row:
    print(f"\nSherif's purchase still intact: {row[0]} | {row[1]} | Login: {row[2]} | Server: {row[4]}")

conn.close()
print("\nDone.")

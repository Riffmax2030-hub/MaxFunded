import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import sqlite3
from app.core.security import verify_password, get_password_hash

conn = sqlite3.connect("riffmax.db")
c = conn.cursor()
rows = c.execute("SELECT id, email, hashed_password, role, is_active, is_admin FROM users").fetchall()

print(f"Total users in DB: {len(rows)}")
for r in rows:
    v = verify_password("Admin2026!", r[2])
    print(f"User: {r[1]} | Role: {r[3]} | Admin: {r[5]} | Active: {r[4]} | Verifies Admin2026!: {v}")

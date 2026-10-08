import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import sqlite3
from app.core.security import get_password_hash

conn = sqlite3.connect("riffmax.db")
c = conn.cursor()

# Set all admin passwords to Admin123!
hashed = get_password_hash("Admin123!")
c.execute("UPDATE users SET hashed_password = ? WHERE role IN ('SUPER_ADMIN', 'ADMIN')", (hashed,))
conn.commit()
print("Updated all admin passwords to: Admin123!")

import sys
sys.path.insert(0, 'c:\\Repositorios\\cwc-poc\\backend')

from database import SessionLocal
import labor_service

db = SessionLocal()
result = labor_service.get_productivity_stats(db)

print("=== Direct function call result ===")
if len(result) > 0:
    print(f"First item: {result[0]}")
    print(f"Keys: {list(result[0].keys())}")
    print(f"Has project_id: {'project_id' in result[0]}")

db.close()

from database import SessionLocal
import labor_service

db = SessionLocal()

print("=== Testing labor_service.get_employee_details_by_project ===\n")

# Test with None
print("1. project_id=None:")
result = labor_service.get_employee_details_by_project(db, None)
print(f"   Returned: {len(result)} employees\n")

# Test with 1
print("2. project_id=1:")
result = labor_service.get_employee_details_by_project(db, 1)
print(f"   Returned: {len(result)} employees")
print(f"   IDs: {[e['employee_id'] for e in result]}\n")

# Test with 2
print("3. project_id=2:")
result = labor_service.get_employee_details_by_project(db, 2)
print(f"   Returned: {len(result)} employees")
print(f"   IDs: {[e['employee_id'] for e in result]}\n")

# Test with 3
print("4. project_id=3:")
result = labor_service.get_employee_details_by_project(db, 3)
print(f"   Returned: {len(result)} employees")
print(f"   IDs: {[e['employee_id'] for e in result]}\n")

db.close()

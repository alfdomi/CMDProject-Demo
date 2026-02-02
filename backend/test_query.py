from database import SessionLocal
import models
from sqlalchemy import func

db = SessionLocal()

print("=== Testing get_employee_details_by_project logic ===\n")

# Test with project_id = 1
project_id = 1
print(f"Testing with project_id={project_id}")

query = db.query(
    models.LaborActual.employee_id,
    func.sum(models.LaborActual.hours).label('total_hours'),
    func.count(func.distinct(func.date(models.LaborActual.date))).label('days_worked')
)

print(f"Query before filter: {query}")

if project_id:
    query = query.filter(models.LaborActual.project_id == project_id)
    print(f"Query after filter: {query}")

results = query.group_by(models.LaborActual.employee_id).all()

print(f"\nResults: {len(results)} employees")
for emp_id, total_hours, days_worked in results:
    print(f"  {emp_id}: {total_hours:.2f}h")

# Now test without filter
print("\n\nTesting with project_id=None")
query2 = db.query(
    models.LaborActual.employee_id,
    func.sum(models.LaborActual.hours).label('total_hours'),
    func.count(func.distinct(func.date(models.LaborActual.date))).label('days_worked')
)

results2 = query2.group_by(models.LaborActual.employee_id).all()
print(f"Results: {len(results2)} employees")

db.close()

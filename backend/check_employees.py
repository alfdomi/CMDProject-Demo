from database import SessionLocal
import models

db = SessionLocal()

# Get all projects
projects = db.query(models.Project).all()

print("=== PROJECTS ===")
for p in projects:
    print(f"ID: {p.id}, Name: {p.name}")

print("\n=== EMPLOYEES PER PROJECT ===")
for p in projects:
    print(f"\n{p.name} (ID: {p.id}):")
    labor_records = db.query(models.LaborActual).filter(models.LaborActual.project_id == p.id).all()
    
    # Group by employee
    from collections import defaultdict
    emp_hours = defaultdict(float)
    for la in labor_records:
        emp_hours[la.employee_id] += la.hours
    
    print(f"  Total employees: {len(emp_hours)}")
    for emp_id, hours in sorted(emp_hours.items()):
        print(f"    {emp_id}: {hours:.2f}h")

db.close()

import models
from database import SessionLocal, engine
import datetime
import random

def seed_database():
    db = SessionLocal()
    
    # Create tables if not exist
    models.Base.metadata.create_all(bind=engine)

    print("Cleaning existing data...")
    db.query(models.LaborActual).delete()
    db.query(models.DispatcherData).delete()
    db.query(models.UnionRate).delete()
    db.query(models.Union).delete()
    db.query(models.Invoice).delete()
    db.query(models.Project).delete()
    db.commit()

    print("Seeding Unions...")
    unions = [
        models.Union(name="IBEW Local 11", description="International Brotherhood of Electrical Workers"),
        models.Union(name="LIUNA Local 300", description="Laborers' International Union of North America"),
        models.Union(name="Carpenters Local 409", description="United Brotherhood of Carpenters and Joiners")
    ]
    db.add_all(unions)
    db.commit()

    print("Seeding Union Rates...")
    for union in unions:
        rates = [
            models.UnionRate(union_id=union.id, payroll_code="REG", rate=45.0, benefit_type="pension"),
            models.UnionRate(union_id=union.id, payroll_code="REG", rate=15.0, benefit_type="health"),
            models.UnionRate(union_id=union.id, payroll_code="OT", rate=67.5, benefit_type="pension"),
        ]
        db.add_all(rates)
    db.commit()

    print("Seeding Projects...")
    projects = [
        models.Project(
            name="Riverside Plaza", 
            location="Los Angeles, CA", 
            manager="Sarah Jenkins", 
            total_budget=2500000.0,
            budget_hours=1200.0, 
            actual_hours=0.0,
            status_notes="On track. Foundation work completed 2 days ahead of schedule.",
            start_date=datetime.datetime.utcnow() - datetime.timedelta(days=60),
            original_completion_date=datetime.datetime.utcnow() + datetime.timedelta(days=120),
            estimated_completion_date=datetime.datetime.utcnow() + datetime.timedelta(days=115) # 5 days ahead
        ),
        models.Project(
            name="Downtown Transit Hub", 
            location="Chicago, IL", 
            manager="Michael Chen", 
            total_budget=8500000.0,
            budget_hours=5000.0, 
            actual_hours=0.0,
            status_notes="Delayed by 1 week due to supply chain issues with structural steel.",
            start_date=datetime.datetime.utcnow() - datetime.timedelta(days=30),
            original_completion_date=datetime.datetime.utcnow() + datetime.timedelta(days=180),
            estimated_completion_date=datetime.datetime.utcnow() + datetime.timedelta(days=187) # 7 days delayed
        ),
        models.Project(
            name="Skyline Apartments", 
            location="Austin, TX", 
            manager="Elena Rodriguez", 
            total_budget=4200000.0,
            budget_hours=3500.0, 
            actual_hours=0.0,
            status_notes="On track. Rough-in plumbing currently being inspected.",
            start_date=datetime.datetime.utcnow() - datetime.timedelta(days=45),
            original_completion_date=datetime.datetime.utcnow() + datetime.timedelta(days=150),
            estimated_completion_date=datetime.datetime.utcnow() + datetime.timedelta(days=150) # On schedule
        ),
    ]
    db.add_all(projects)
    db.commit()

    print("Seeding Project Events & Media...")
    for project in projects:
        # Add Events
        events = [
            models.ProjectEvent(
                project_id=project.id,
                title="Initial Site Inspection",
                date=project.start_date + datetime.timedelta(days=2),
                event_type="inspection"
            ),
            models.ProjectEvent(
                project_id=project.id,
                title="Phase 1 Advance Received",
                date=project.start_date + datetime.timedelta(days=10),
                event_type="payment",
                amount=project.total_budget * 0.15 if project.total_budget else 15000.0
            ),
            models.ProjectEvent(
                project_id=project.id,
                title="Safety Audit - Passed",
                date=datetime.datetime.utcnow() - datetime.timedelta(days=5),
                event_type="inspection"
            ),
            models.ProjectEvent(
                project_id=project.id,
                title="Material Purchase - Concrete",
                date=datetime.datetime.utcnow() - datetime.timedelta(days=2),
                event_type="expense",
                category="materials",
                amount=5400.0
            )
        ]
        db.add_all(events)
        
        # Add Media
        media = [
            models.ProjectMedia(
                project_id=project.id,
                filename="Site_Survey.pdf",
                file_type="document",
                url="https://example.com/docs/survey.pdf"
            ),
            models.ProjectMedia(
                project_id=project.id,
                filename="Excavation_Progress.jpg",
                file_type="image",
                url="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800"
            ),
            models.ProjectMedia(
                project_id=project.id,
                filename="Structural_Blueprints.pdf",
                file_type="document",
                url="https://example.com/docs/blueprints.pdf"
            )
        ]
        db.add_all(media)
    db.commit()

    print("Seeding Labor Actuals...")
    # Create a pool of employees that will work across multiple projects
    employee_pool = [f"EMP{i:03d}" for i in range(101, 121)]  # 20 employees: EMP101 to EMP120
    
    for project in projects:
        total_hours = 0
        # Each project will have 10-15 labor entries
        num_entries = random.randint(10, 15)
        
        # Select 5-8 employees from the pool to work on this project
        project_employees = random.sample(employee_pool, random.randint(5, 8))
        
        for i in range(num_entries):
            hours = random.uniform(4, 10)
            is_billable = random.choice([True, True, True, False])  # 75% billable
            # Pick an employee from this project's employee list
            employee_id = random.choice(project_employees)
            
            labor = models.LaborActual(
                project_id=project.id,
                employee_id=employee_id,
                date=datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(0, 30)),
                hours=hours,
                payroll_code="REG",
                is_billable=is_billable
            )
            db.add(labor)
            total_hours += hours
        project.actual_hours = total_hours
    db.commit()

    print("Seeding Invoices...")
    categories = ["Fuel", "Materials", "Equipment Rental", "Subcontractor"]
    vendors = ["Texaco", "Home Depot", "United Rentals", "Structural Steel Inc"]
    
    for _ in range(20):
        category = random.choice(categories)
        amount = random.uniform(500, 15000)
        
        # Create an anomaly for Fuel simulation
        anomaly_flag = False
        anomaly_description = None
        if category == "Fuel" and amount > 12000:
            anomaly_flag = True
            anomaly_description = "Significant spike compared to historical average."

        invoice = models.Invoice(
            vendor=random.choice(vendors),
            category=category,
            amount=amount,
            date=datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(0, 60)),
            anomaly_flag=anomaly_flag,
            anomaly_description=anomaly_description
        )
        db.add(invoice)
    db.commit()

    print("Database seeding completed successfully!")
    db.close()

if __name__ == "__main__":
    seed_database()

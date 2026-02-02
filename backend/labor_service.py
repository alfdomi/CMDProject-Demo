from sqlalchemy.orm import Session
from sqlalchemy import func
import models

def get_productivity_stats(db: Session):
    """
    Calculates billable vs overhead hours per project from the database.
    """
    projects = db.query(models.Project).all()
    results = []

    for project in projects:
        billable = db.query(func.sum(models.LaborActual.hours)).filter(
            models.LaborActual.project_id == project.id,
            models.LaborActual.is_billable == True
        ).scalar() or 0.0

        overhead = db.query(func.sum(models.LaborActual.hours)).filter(
            models.LaborActual.project_id == project.id,
            models.LaborActual.is_billable == False
        ).scalar() or 0.0

        results.append({
            "project_id": project.id,
            "project_name": project.name,
            "billable_hours": billable,
            "overhead_hours": overhead,
            "delta": billable - overhead
        })
    
    return results

def get_total_aggregates(db: Session):
    billable = db.query(func.sum(models.LaborActual.hours)).filter(models.LaborActual.is_billable == True).scalar() or 0.0
    overhead = db.query(func.sum(models.LaborActual.hours)).filter(models.LaborActual.is_billable == False).scalar() or 0.0
    project_names = [p.name for p in db.query(models.Project).all()]
    
    return billable, overhead, project_names

def get_employee_details_by_project(db: Session, project_id: int = None):
    """
    Returns employee details aggregated by employee and optionally filtered by project.
    
    When project_id is provided:
    - Only shows employees who worked on that specific project
    - Hours shown are ONLY the hours worked on that project (not total across all projects)
    
    When project_id is None:
    - Shows all employees across all projects
    - Hours shown are total hours across all projects
    """
    print(f"[labor_service] get_employee_details_by_project called with project_id={project_id}, type={type(project_id)}")
    
    query = db.query(
        models.LaborActual.employee_id,
        func.sum(models.LaborActual.hours).label('total_hours'),
        func.count(func.distinct(func.date(models.LaborActual.date))).label('days_worked')
    )
    
    # Filter by project if specified - this ensures we only get hours for THIS project
    if project_id:
        print(f"[labor_service] Applying filter for project_id={project_id}")
        query = query.filter(models.LaborActual.project_id == project_id)
    else:
        print(f"[labor_service] No filter applied (project_id is {project_id})")
    
    results = query.group_by(models.LaborActual.employee_id).all()
    print(f"[labor_service] Query returned {len(results)} employees")
    
    employees = []
    for emp_id, total_hours, days_worked in results:
        # Calculate salary based on hours (project-specific if filtered)
        salary = total_hours * 85
        
        # Mock data for demonstration (in production, this would come from employee table)
        import random
        random.seed(hash(emp_id))  # Consistent mock data per employee
        days_absent = random.randint(0, 5)
        vacation_days = random.randint(5, 20)
        months_employed = random.randint(6, 60)
        
        employees.append({
            "employee_id": emp_id,
            "employee_name": f"Employee {emp_id}",  # Use ID as name for now
            "total_hours": float(total_hours),
            "salary": float(salary),
            "days_absent": days_absent,
            "vacation_days": vacation_days,
            "months_employed": months_employed
        })
    
    return employees

def get_payroll_estimation(db: Session):
    """
    Estimates the upcoming week's payroll based on the last 30 days of activity.
    Calculation: Average daily hours per active employee * 7 days * Average rate ($85)
    """
    from datetime import datetime, timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    # Get active employees and their total hours in the last 30 days
    active_labor = db.query(
        models.LaborActual.employee_id,
        func.sum(models.LaborActual.hours).label('month_hours')
    ).filter(models.LaborActual.date >= thirty_days_ago).group_by(models.LaborActual.employee_id).all()
    
    if not active_labor:
        return {"estimated_weekly_payroll": 0.0, "active_employees": 0, "avg_hourly_rate": 85.0}
    
    total_month_hours = sum(emp.month_hours for emp in active_labor)
    num_employees = len(active_labor)
    
    # Weekly average = (Total month hours / 30) * 7
    weekly_hours_projection = (total_month_hours / 30.0) * 7.0
    
    HOURLY_RATE = 85.0
    estimated_payroll = weekly_hours_projection * HOURLY_RATE
    
    return {
        "estimated_weekly_payroll": float(estimated_payroll),
        "active_employees": num_employees,
        "avg_hourly_rate": HOURLY_RATE,
        "projected_hours": float(weekly_hours_projection)
    }

def get_union_reconciliation_data(db: Session):
    """
    Reconciles labor actuals with union benefit rates to calculate liabilities.
    For this demo, we map employees to unions based on their ID range.
    """
    unions = db.query(models.Union).all()
    if not unions:
        return []
        
    results = []
    for union in unions:
        # Get all rates for this union
        rates = db.query(models.UnionRate).filter(models.UnionRate.union_id == union.id).all()
        
        # In a real system, we'd filter LaborActual by employees belonging to this union.
        # For demo, we'll assign approx 1/3 of labor to each union.
        total_liability = 0.0
        benefit_breakdown = {} # benefit_type -> amount
        
        for rate in rates:
            # Sum hours for the payroll code associated with this benefit rate
            # We mock the volume as a fraction of total labor
            total_hours = db.query(func.sum(models.LaborActual.hours)).filter(
                models.LaborActual.payroll_code == rate.payroll_code
            ).scalar() or 0.0
            
            # Allocation factor (1 / number of unions)
            allocation = 1.0 / len(unions)
            liability = total_hours * rate.rate * allocation
            
            total_liability += liability
            benefit_breakdown[rate.benefit_type] = benefit_breakdown.get(rate.benefit_type, 0.0) + liability
            
        results.append({
            "union_id": union.id,
            "union_name": union.name,
            "total_liability": float(total_liability),
            "benefit_breakdown": {k: float(v) for k, v in benefit_breakdown.items()}
        })
        
    return results

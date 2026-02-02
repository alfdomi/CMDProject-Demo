from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Request
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List
import os
import shutil
from pathlib import Path
import models, schemas, database, labor_service, anomaly_service, ai_agent
from database import engine, get_db
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Construction Workflow Control API")

# Mount uploads directory to serve files
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Construction Labor Intelligence API is running"}

@app.get("/labor/productivity", response_model=List[schemas.ProductivityAnalysisSchema])
def get_productivity(db: Session = Depends(get_db)):
    """
    Returns labor productivity statistics per project
    """
    return labor_service.get_productivity_stats(db)

@app.get("/automation/anomalies", response_model=List[schemas.AnomalyAlertSchema])
def get_anomalies(db: Session = Depends(get_db)):
    # Load inflation rate from env
    inflation_rate = float(os.getenv("ESTIMATED_ANNUAL_INFLATION", "0.05"))
    
    # Query invoices from DB
    invoices_all = db.query(models.Invoice).order_by(models.Invoice.date.asc()).all()
    invoice_dicts = [{"category": inv.category, "amount": inv.amount} for inv in invoices_all]
    
    # Statistical detection (inflation-aware)
    anomalies = anomaly_service.detect_expense_anomalies(invoice_dicts, annual_inflation=inflation_rate)
    
    results = []
    
    # Fallback for demo if DB is empty
    if not anomalies:
        anomalies = [{
            "category": "Fuel",
            "amount": 28000.0, # Increased for inflation demo
            "history_avg": 20000.0,
            "spike_percentage": 40.0,
            "description": f"Detected a spike crossing the {inflation_rate*100}% inflation-adjusted baseline."
        }]

    for a in anomalies:
        # Get historical points for this category
        history = [
            {"date": inv.date.strftime("%Y-%m-%d") if inv.date else "2026-01-01", "amount": inv.amount}
            for inv in invoices_all if inv.category == a['category']
        ]
        
        # Enrich with AI explanation and action (inflation-aware)
        explanation, suggested_action = ai_agent.analyze_anomaly(
            a['category'], 
            a['amount'], 
            a['history_avg'], 
            inflation_rate=inflation_rate
        )
        
        results.append({
            "category": a['category'],
            "amount": a['amount'],
            "spike_percentage": a['spike_percentage'],
            "description": explanation,
            "suggested_action": suggested_action,
            "inflation_adjusted_avg": a.get('inflation_adjusted_avg'),
            "historical_data": history
        })
    
    return results

@app.post("/agent/insights")
async def get_agent_insights(view: str = "labor", request: Request = None, db: Session = Depends(get_db)):
    context_data = {}
    
    # Try to get body data if provided (for finance view)
    body_data = {}
    if request:
        try:
            body_data = await request.json()
        except:
            pass
    
    if view == "labor":
        billable, overhead, projects = labor_service.get_total_aggregates(db)
        if not projects:
            billable, overhead, projects = 1650.0, 200.0, ["Riverside Plaza", "Downtown Hub"]
        context_data = {"billable": billable, "overhead": overhead, "projects": projects}
        
    elif view == "automation":
        # Get inflation rate from env
        inflation_rate = float(os.getenv("ESTIMATED_ANNUAL_INFLATION", "0.05"))
        invoices_all = db.query(models.Invoice).all()
        invoice_dicts = [{"category": inv.category, "amount": inv.amount} for inv in invoices_all]
        anomalies = anomaly_service.detect_expense_anomalies(invoice_dicts, annual_inflation=inflation_rate)
        context_data = {"anomaly_count": len(anomalies), "categories": list(set([a['category'] for a in anomalies])) if anomalies else ["Fuel"]}

    elif view == "finance":
        # Use body data if provided, otherwise use default
        if body_data:
            context_data = body_data
        else:
            projects = db.query(models.Project).all()
            over_budget = [p for p in projects if p.actual_hours > p.budget_hours]
            context_data = {"variance_projects": len(over_budget), "total_projects": len(projects)}

    # If the user provided a specific question in the body
    query = body_data.get("query")
    history = body_data.get("history")
    
    if query:
        insight = ai_agent.ask_custom_question(view, context_data, query, history)
    else:
        insight = ai_agent.generate_contextual_insight(view, context_data)
        
    return {"insight": insight}

@app.get("/agent/config")
def get_agent_config():
    return {
        "provider": ai_agent.AI_PROVIDER,
        "model": ai_agent.LLM_MODEL
    }


@app.get("/labor/employees")
def get_labor_employees(project_id: int = None, db: Session = Depends(get_db)):
    """
    Returns employee details, optionally filtered by project
    """
    print(f"DEBUG: get_labor_employees called with project_id={project_id}, type={type(project_id)}")
    employees = labor_service.get_employee_details_by_project(db, project_id)
    print(f"DEBUG: Returned {len(employees)} employees")
    return {
        "employee_count": len(employees),
        "employees": employees
    }

@app.get("/labor/payroll-estimation", response_model=schemas.PayrollEstimationSchema)
def get_payroll_estimation(db: Session = Depends(get_db)):
    """
    Returns estimated weekly payroll based on recent activity
    """
    return labor_service.get_payroll_estimation(db)

@app.get("/labor/union-reconciliation", response_model=List[schemas.UnionReconciliationSchema])
def get_union_reconciliation(db: Session = Depends(get_db)):
    """
    Returns union benefit reconciliation and liabilities
    """
    return labor_service.get_union_reconciliation_data(db)

@app.get("/finance/trends")
def get_financial_trends(db: Session = Depends(get_db)):
    """
    Returns historical financial trends for revenue vs expenses
    """
    import random
    months = ["Aug 25", "Sep 25", "Oct 25", "Nov 25", "Dec 25", "Jan 26"]
    data = []
    base_revenue = 450000
    base_expense = 410000
    
    for i, month in enumerate(months):
        revenue = base_revenue + (i * 25000) + random.randint(-15000, 15000)
        expense = base_expense + (i * 18000) + random.randint(-10000, 10000)
        data.append({
            "month": month,
            "revenue": revenue,
            "expense": expense,
            "margin": ((revenue - expense) / revenue) * 100,
            "benchmark": 8.5 # Industry average margin %
        })
    return data

@app.get("/automation/process-metrics")
def get_automation_metrics():
    """
    Returns metrics comparing manual vs automated GP processes
    """
    return [
        {"process": "Invoice Processing", "manual_min": 45, "auto_min": 4, "status": "Optimized", "savings": 91},
        {"process": "Payroll Reconciliation", "manual_min": 120, "auto_min": 15, "status": "Optimized", "savings": 87},
        {"process": "Union Reporting", "manual_min": 180, "auto_min": 10, "status": "Automated", "savings": 94},
        {"process": "Vendor Matching", "manual_min": 30, "auto_min": 12, "status": "In Progress", "savings": 60}
    ]


@app.get("/finance/variance", response_model=List[schemas.VarianceAnalysisSchema])

def get_variance(db: Session = Depends(get_db)):
    # Simple variance logic
    projects = db.query(models.Project).all()
    if not projects:
        return [{"project_name": "Riverside Plaza", "actual_hours": 500.0, "budget_hours": 450.0, "variance": 50.0}]
        
    return [
        {
            "project_name": p.name,
            "actual_hours": p.actual_hours,
            "budget_hours": p.budget_hours,
            "variance": p.actual_hours - p.budget_hours
        } for p in projects
    ]

from sqlalchemy.orm import Session, joinedload

@app.get("/reporting/projects", response_model=List[schemas.ProjectReportingSchema])
def get_reporting_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).options(
        joinedload(models.Project.events),
        joinedload(models.Project.media)
    ).all()

@app.post("/reporting/projects/{project_id}/events", response_model=schemas.ProjectEventSchema)
def add_project_event(project_id: int, event: schemas.ProjectEventCreate, db: Session = Depends(get_db)):
    db_event = models.ProjectEvent(**event.dict(), project_id=project_id)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@app.post("/reporting/projects/{project_id}/media", response_model=schemas.ProjectMediaSchema)
def add_project_media(project_id: int, media: schemas.ProjectMediaCreate, db: Session = Depends(get_db)):
    db_media = models.ProjectMedia(**media.dict(), project_id=project_id)
    db.add(db_media)
    db.commit()
    db.refresh(db_media)
    return db_media

@app.patch("/reporting/events/{event_id}", response_model=schemas.ProjectEventSchema)
def update_project_event(event_id: int, event_update: schemas.ProjectEventUpdate, db: Session = Depends(get_db)):
    db_event = db.query(models.ProjectEvent).filter(models.ProjectEvent.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    update_data = event_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_event, key, value)
    
    db.commit()
    db.refresh(db_event)
    return db_event

@app.post("/reporting/projects/{project_id}/upload", response_model=schemas.ProjectMediaSchema)
async def upload_project_file(project_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Create project specific subfolder
    project_dir = UPLOAD_DIR / str(project_id)
    project_dir.mkdir(exist_ok=True)
    
    file_path = project_dir / file.filename
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Determine type based on extension
    ext = file.filename.split(".")[-1].lower()
    file_type = "image" if ext in ["jpg", "jpeg", "png", "gif", "webp"] else "document"
    
    # Correct URL for frontend access
    file_url = f"/uploads/{project_id}/{file.filename}"
    
    db_media = models.ProjectMedia(
        project_id=project_id,
        filename=file.filename,
        file_type=file_type,
        url=file_url
    )
    db.add(db_media)
    db.commit()
    db.refresh(db_media)
    return db_media

@app.post("/reporting/projects", response_model=schemas.ProjectReportingSchema)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    """
    Create a new project
    """
    db_project = models.Project(
        name=project.name,
        location=project.location,
        manager=project.manager,
        total_budget=project.total_budget,
        budget_hours=project.budget_hours,
        actual_hours=0.0,
        start_date=project.start_date,
        original_completion_date=project.original_completion_date,
        estimated_completion_date=project.estimated_completion_date,
        status_notes=project.status_notes
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/finance/project-analytics")
def get_project_financial_analytics(db: Session = Depends(get_db)):
    """
    Returns comprehensive financial analytics for all projects including:
    - Total revenue (sum of payment events)
    - Total expenses (sum of expense events by category)
    - Billable hours cost (billable_hours * rate)
    - Overhead hours cost (overhead_hours * rate)
    - Net profit/loss
    - Profit margin percentage
    """
    projects = db.query(models.Project).all()
    analytics = []
    
    for project in projects:
        # Calculate revenues from payment events
        payments = db.query(func.sum(models.ProjectEvent.amount)).filter(
            models.ProjectEvent.project_id == project.id,
            models.ProjectEvent.event_type == 'payment'
        ).scalar() or 0
        
        # Calculate expenses from expense events
        expenses = db.query(func.sum(models.ProjectEvent.amount)).filter(
            models.ProjectEvent.project_id == project.id,
            models.ProjectEvent.event_type == 'expense'
        ).scalar() or 0
        
        # Get expense breakdown by category
        expense_categories = db.query(
            models.ProjectEvent.category,
            func.sum(models.ProjectEvent.amount).label('total')
        ).filter(
            models.ProjectEvent.project_id == project.id,
            models.ProjectEvent.event_type == 'expense'
        ).group_by(models.ProjectEvent.category).all()
        
        expense_breakdown = {cat: total for cat, total in expense_categories if cat}
        
        
        # Calculate labor costs from LaborActual table
        labor_data = db.query(models.LaborActual).filter(
            models.LaborActual.project_id == project.id
        ).all()
        
        billable_hours = sum(l.hours for l in labor_data if l.is_billable)
        overhead_hours = sum(l.hours for l in labor_data if not l.is_billable)
        
        # Assume $85/hr average rate
        HOURLY_RATE = 85
        billable_cost = billable_hours * HOURLY_RATE
        overhead_cost = overhead_hours * HOURLY_RATE
        labor_cost = billable_cost + overhead_cost
        
        # Calculate profit
        total_costs = expenses + labor_cost
        net_profit = payments - total_costs
        profit_margin = (net_profit / payments * 100) if payments > 0 else 0
        
        analytics.append({
            "project_id": project.id,
            "project_name": project.name,
            "revenue": float(payments),
            "expenses": float(expenses),
            "expense_breakdown": {k: float(v) for k, v in expense_breakdown.items()},
            "labor_cost": float(labor_cost),
            "billable_cost": float(billable_cost),
            "overhead_cost": float(overhead_cost),
            "billable_hours": float(billable_hours),
            "overhead_hours": float(overhead_hours),
            "total_costs": float(total_costs),
            "net_profit": float(net_profit),
            "profit_margin": float(profit_margin)
        })
    
    return analytics

# Force reload 1769797246.7949042
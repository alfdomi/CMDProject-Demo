from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UnionBase(BaseModel):
    name: str
    description: Optional[str] = None

class UnionCreate(UnionBase):
    pass

class UnionRateSchema(BaseModel):
    payroll_code: str
    rate: float
    benefit_type: str

    class Config:
        from_attributes = True

class UnionSchema(UnionBase):
    id: int
    rate_tables: List[UnionRateSchema] = []

    class Config:
        from_attributes = True

class ProductivityAnalysisSchema(BaseModel):
    project_id: int
    project_name: str
    billable_hours: float
    overhead_hours: float
    delta: float

class PayrollEstimationSchema(BaseModel):
    estimated_weekly_payroll: float
    active_employees: int
    avg_hourly_rate: float
    projected_hours: float

class UnionReconciliationSchema(BaseModel):
    union_id: int
    union_name: str
    total_liability: float
    benefit_breakdown: dict

class HistoricalPoint(BaseModel):
    date: str
    amount: float

class AnomalyAlertSchema(BaseModel):
    category: str
    amount: float
    spike_percentage: float
    description: str
    suggested_action: str
    inflation_adjusted_avg: Optional[float] = None
    historical_data: List[HistoricalPoint]

class VarianceAnalysisSchema(BaseModel):
    project_name: str
    actual_hours: float
    budget_hours: float
    variance: float

class ProjectEventSchema(BaseModel):
    id: int
    title: str
    date: datetime
    event_type: str
    category: Optional[str] = None
    amount: Optional[float] = None
    
    class Config:
        from_attributes = True

class ProjectEventCreate(BaseModel):
    title: str
    date: datetime
    event_type: str
    category: Optional[str] = None
    amount: Optional[float] = None

class ProjectEventUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[datetime] = None
    event_type: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = None

class ProjectMediaSchema(BaseModel):
    id: int
    filename: str
    file_type: str
    url: str
    
    class Config:
        from_attributes = True

class ProjectMediaCreate(BaseModel):
    filename: str
    file_type: str
    url: str

class ProjectCreate(BaseModel):
    name: str
    location: Optional[str] = None
    manager: Optional[str] = None
    total_budget: Optional[float] = None
    budget_hours: float = 0.0
    start_date: Optional[datetime] = None
    original_completion_date: Optional[datetime] = None
    estimated_completion_date: Optional[datetime] = None
    status_notes: Optional[str] = None

class ProjectReportingSchema(BaseModel):
    id: int
    name: str
    location: Optional[str] = None
    manager: Optional[str] = None
    total_budget: Optional[float] = None
    budget_hours: float
    actual_hours: float
    status_notes: Optional[str] = None
    
    # New fields
    start_date: Optional[datetime] = None
    original_completion_date: Optional[datetime] = None
    estimated_completion_date: Optional[datetime] = None
    
    events: List[ProjectEventSchema] = []
    media: List[ProjectMediaSchema] = []
    
    class Config:
        from_attributes = True

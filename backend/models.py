from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Union(Base):
    __tablename__ = "unions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    rate_tables = relationship("UnionRate", back_populates="union")

class UnionRate(Base):
    __tablename__ = "union_rates"

    id = Column(Integer, primary_key=True, index=True)
    union_id = Column(Integer, ForeignKey("unions.id"))
    payroll_code = Column(String, index=True)
    rate = Column(Float)
    benefit_type = Column(String) # e.g., 'pension', 'health', 'training'
    
    union = relationship("Union", back_populates="rate_tables")

class LaborActual(Base):
    __tablename__ = "labor_actuals"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    employee_id = Column(String)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    hours = Column(Float)
    payroll_code = Column(String)
    is_billable = Column(Boolean, default=True)

class DispatcherData(Base):
    __tablename__ = "dispatcher_data"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    scheduled_date = Column(DateTime)
    scheduled_hours = Column(Float)

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)
    manager = Column(String)
    total_budget = Column(Float)
    budget_hours = Column(Float)
    actual_hours = Column(Float, default=0.0)
    status_notes = Column(String)
    
    # New timeline fields
    start_date = Column(DateTime)
    original_completion_date = Column(DateTime)
    estimated_completion_date = Column(DateTime)
    
    events = relationship("ProjectEvent", back_populates="project")
    media = relationship("ProjectMedia", back_populates="project")

class ProjectEvent(Base):
    __tablename__ = "project_events"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    title = Column(String)
    date = Column(DateTime)
    event_type = Column(String) # inspection, payment, milestone, expense
    category = Column(String, nullable=True) # materiales, nómina, equipo, administración, otros
    amount = Column(Float, nullable=True) # For payments/expenses
    
    project = relationship("Project", back_populates="events")

class ProjectMedia(Base):
    __tablename__ = "project_media"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    filename = Column(String)
    file_type = Column(String) # image, document
    url = Column(String)
    
    project = relationship("Project", back_populates="media")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    vendor = Column(String)
    category = Column(String) # e.g., 'fuel', 'materials'
    amount = Column(Float)
    date = Column(DateTime)
    anomaly_flag = Column(Boolean, default=False)
    anomaly_description = Column(String)

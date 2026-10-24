import json
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Text,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship
from ..database import Base


class DBProfile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=True)
    home_city = Column(String(255), nullable=True)

    travel_style = Column(String(50), default="mixed")
    budget_level = Column(String(50), default="moderate")
    interests = Column(JSON, default=list)
    dietary_notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    trips = relationship("DBTrip", back_populates="user", cascade="all, delete-orphan")


class DBTrip(Base):
    __tablename__ = "trips"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), index=True, default="guest-user")
    title = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False, index=True)
    country = Column(String(255), nullable=True)
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=False)
    travelers_count = Column(Integer, default=1)
    budget_amount = Column(Float, nullable=True)
    currency = Column(String(10), default="USD")
    status = Column(String(50), default="planning")
    notes = Column(Text, nullable=True)
    preferences = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("DBProfile", back_populates="trips")
    itinerary_days = relationship(
        "DBItineraryDay",
        back_populates="trip",
        cascade="all, delete-orphan",
        order_by="DBItineraryDay.day_number",
    )


class DBItineraryDay(Base):
    __tablename__ = "itinerary_days"

    id = Column(String(36), primary_key=True, index=True)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), index=True)
    day_number = Column(Integer, nullable=False)
    date = Column(String(50), nullable=False)
    title = Column(String(255), nullable=True)
    theme = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)

    trip = relationship("DBTrip", back_populates="itinerary_days")
    activities = relationship(
        "DBActivity",
        back_populates="day",
        cascade="all, delete-orphan",
        order_by="DBActivity.sort_order",
    )


class DBActivity(Base):
    __tablename__ = "activities"

    id = Column(String(36), primary_key=True, index=True)
    day_id = Column(String(36), ForeignKey("itinerary_days.id", ondelete="CASCADE"), index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(50), default="sightseeing")
    start_time = Column(String(20), nullable=True)
    end_time = Column(String(20), nullable=True)
    location = Column(String(255), nullable=True)
    estimated_cost = Column(Float, default=0.0)
    currency = Column(String(10), default="USD")
    notes = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0)
    pacing_tag = Column(String(50), nullable=True)
    accessibility_note = Column(String(255), nullable=True)
    dietary_note = Column(String(255), nullable=True)

    day = relationship("DBItineraryDay", back_populates="activities")


class DBHistory(Base):
    __tablename__ = "history_logs"

    id = Column(String(36), primary_key=True, index=True)
    trip_id = Column(String(36), nullable=False, index=True)
    destination = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    days_count = Column(Integer, default=1)
    generated_at = Column(String(50), nullable=False)
    model_used = Column(String(100), default="daytrail-ai-engine")
    summary = Column(Text, nullable=True)

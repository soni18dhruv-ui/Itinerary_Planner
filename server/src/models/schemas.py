from typing import List, Optional, Literal
from pydantic import BaseModel, Field

PacingLevel = Literal["relaxed", "moderate", "fast"]
TravelStyle = Literal["adventure", "relaxation", "culture", "food", "mixed"]
BudgetLevel = Literal["budget", "moderate", "luxury"]
TripStatus = Literal["planning", "upcoming", "completed"]
ActivityCategory = Literal[
    "sightseeing",
    "food",
    "transport",
    "lodging",
    "leisure",
    "culture",
    "nature",
    "other",
]


class TravelPreferencesSchema(BaseModel):
    travel_style: TravelStyle = "mixed"
    pacing: PacingLevel = "moderate"
    budget_level: BudgetLevel = "moderate"
    interests: List[str] = Field(default_factory=list)
    dietary_restrictions: List[str] = Field(default_factory=list)
    mobility_concerns: List[str] = Field(default_factory=list)
    special_requests: Optional[str] = None


class ActivitySchema(BaseModel):
    id: str
    day_id: str
    title: str
    category: ActivityCategory = "sightseeing"
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = None
    estimated_cost: Optional[float] = 0.0
    currency: Optional[str] = "USD"
    notes: Optional[str] = None
    sort_order: int = 0
    pacing_tag: Optional[str] = None
    accessibility_note: Optional[str] = None
    dietary_note: Optional[str] = None


class ActivityCreateInput(BaseModel):
    title: str
    category: ActivityCategory = "sightseeing"
    start_time: Optional[str] = "10:00"
    end_time: Optional[str] = "11:30"
    location: Optional[str] = None
    estimated_cost: Optional[float] = 0.0
    notes: Optional[str] = None
    sort_order: Optional[int] = 0


class ActivityUpdateRequest(BaseModel):
    title: Optional[str] = None
    category: Optional[ActivityCategory] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = None
    estimated_cost: Optional[float] = None
    currency: Optional[str] = None
    notes: Optional[str] = None
    sort_order: Optional[int] = None
    pacing_tag: Optional[str] = None
    accessibility_note: Optional[str] = None
    dietary_note: Optional[str] = None


class ItineraryDaySchema(BaseModel):
    id: str
    trip_id: str
    day_number: int
    date: str
    title: Optional[str] = None
    theme: Optional[str] = None
    notes: Optional[str] = None
    activities: List[ActivitySchema] = Field(default_factory=list)


class TripCreateRequest(BaseModel):
    title: str
    destination: str
    country: Optional[str] = None
    start_date: str
    end_date: str
    travelers_count: int = Field(default=1, ge=1)
    budget_amount: Optional[float] = None
    currency: str = "USD"
    preferences: TravelPreferencesSchema = Field(default_factory=TravelPreferencesSchema)
    generate: bool = True
    user_id: Optional[str] = "guest-user"


class TripUpdateRequest(BaseModel):
    title: Optional[str] = None
    destination: Optional[str] = None
    country: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    travelers_count: Optional[int] = None
    budget_amount: Optional[float] = None
    currency: Optional[str] = None
    status: Optional[TripStatus] = None
    notes: Optional[str] = None
    preferences: Optional[TravelPreferencesSchema] = None


class TripResponse(BaseModel):
    id: str
    user_id: str
    title: str
    destination: str
    country: Optional[str] = None
    start_date: str
    end_date: str
    travelers_count: int
    budget_amount: Optional[float] = None
    currency: str
    status: TripStatus
    notes: Optional[str] = None
    preferences: TravelPreferencesSchema
    created_at: str
    updated_at: str
    itinerary_days: List[ItineraryDaySchema] = Field(default_factory=list)


class TripListResponse(BaseModel):
    trips: List[TripResponse]
    total: int


class PromptPreviewRequest(BaseModel):
    destination: str
    country: Optional[str] = None
    start_date: str
    end_date: str
    travelers_count: int = 1
    budget_amount: Optional[float] = None
    currency: str = "USD"
    preferences: TravelPreferencesSchema


class PromptPreviewResponse(BaseModel):
    system_prompt: str
    user_prompt: str
    personalization_summary: dict
    pacing_rules: List[str]
    dietary_directives: List[str]
    mobility_directives: List[str]


class ItineraryGenerateRequest(BaseModel):
    destination: str
    country: Optional[str] = None
    start_date: str
    end_date: str
    travelers_count: int = 1
    budget_amount: Optional[float] = None
    currency: str = "USD"
    preferences: TravelPreferencesSchema


class HistoryItemSchema(BaseModel):
    id: str
    trip_id: str
    destination: str
    title: str
    days_count: int
    generated_at: str
    model_used: str
    summary: str


class ProfileResponse(BaseModel):
    id: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    home_city: Optional[str] = None
    travel_style: TravelStyle = "mixed"
    budget_level: BudgetLevel = "moderate"
    interests: List[str] = Field(default_factory=list)
    dietary_notes: Optional[str] = None
    created_at: str
    updated_at: str


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    home_city: Optional[str] = None
    travel_style: Optional[TravelStyle] = None
    budget_level: Optional[BudgetLevel] = None
    interests: Optional[List[str]] = None
    dietary_notes: Optional[str] = None


class SignUpRequest(BaseModel):
    full_name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    token: str
    user: dict
    profile: ProfileResponse



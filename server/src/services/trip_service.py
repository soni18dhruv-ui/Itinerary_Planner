import uuid
from datetime import datetime
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from ..database import SessionLocal, init_db
from ..models.db_models import DBProfile, DBTrip, DBItineraryDay, DBActivity
from ..models.schemas import (
    TripCreateRequest,
    TripUpdateRequest,
    TripResponse,
    ItineraryDaySchema,
    ActivitySchema,
    ActivityCreateInput,
    ActivityUpdateRequest,
    ProfileResponse,
    ProfileUpdateRequest,
    TravelPreferencesSchema,
)


class TripService:
    """
    MySQL-backed Trip Service using SQLAlchemy ORM.
    Persists profiles, trips, itinerary days, and activities permanently in MySQL.
    """

    def __init__(self):
        init_db()
        self._ensure_sample_data()

    def _get_db(self) -> Session:
        return SessionLocal()

    def _ensure_user_profile(self, db: Session, user_id: str):
        profile = db.query(DBProfile).filter(DBProfile.id == user_id).first()
        if not profile:
            profile = DBProfile(
                id=user_id,
                full_name="Alex Vance" if user_id == "guest-user" or user_id == "demo-user" else "Traveler",
                home_city="San Francisco",
                travel_style="culture",
                budget_level="moderate",
                interests=["history", "photography", "markets", "coffee"],
                dietary_notes="Vegetarian",
            )
            db.add(profile)
            db.commit()

    def _ensure_sample_data(self):
        db = self._get_db()
        try:
            count = db.query(DBTrip).count()
            if count == 0:
                self._seed_sample_trips(db)
        except Exception as e:
            print(f"Error checking/seeding MySQL data: {e}")
        finally:
            db.close()

    def _seed_sample_trips(self, db: Session):
        self._ensure_user_profile(db, "demo-user")
        self._ensure_user_profile(db, "guest-user")
        self._ensure_user_profile(db, "guest-traveler")

        t1_id = "sample-trip-kyoto"
        day1_id = str(uuid.uuid4())
        day2_id = str(uuid.uuid4())

        sample_pref = {
            "travel_style": "culture",
            "pacing": "moderate",
            "budget_level": "moderate",
            "interests": ["history", "photography", "tea ceremonies", "gardens"],
            "dietary_restrictions": ["Vegetarian"],
            "mobility_concerns": ["Minimal Walking"],
            "special_requests": "Prefers morning temple visits to beat tourist tour buses.",
        }

        db_trip = DBTrip(
            id=t1_id,
            user_id="demo-user",
            title="Kyoto Autumn Cultural Journey",
            destination="Kyoto",
            country="Japan",
            start_date="2026-11-10",
            end_date="2026-11-15",
            travelers_count=2,
            budget_amount=2800.0,
            currency="USD",
            status="upcoming",
            notes="Book Shinkansen tickets 30 days ahead.",
            preferences=sample_pref,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(db_trip)
        db.flush()

        # Day 1
        d1 = DBItineraryDay(
            id=day1_id,
            trip_id=t1_id,
            day_number=1,
            date="2026-11-10",
            title="Arrive in Kyoto & Historic Gion Evening",
            theme="Culture • Moderate",
            notes="Orientation walk along Shijo Dori and lantern-lit Shirakawa canal.",
        )
        db.add(d1)
        db.flush()

        a1 = DBActivity(
            id=str(uuid.uuid4()),
            day_id=day1_id,
            title="Shinkansen Arrival & Hotel Check-in",
            category="transport",
            start_time="13:00",
            end_time="14:30",
            location="Kyoto Station Area",
            estimated_cost=0.0,
            currency="USD",
            notes="Direct transfer from Kyoto station; step-free taxi stands available.",
            sort_order=0,
            pacing_tag="moderate",
            accessibility_note="Step-free access",
        )
        a2 = DBActivity(
            id=str(uuid.uuid4()),
            day_id=day1_id,
            title="Gion Shirakawa Sunset Stroll",
            category="sightseeing",
            start_time="16:00",
            end_time="17:30",
            location="Gion, Kyoto",
            estimated_cost=0.0,
            currency="USD",
            notes="Paved flat flagstone path along willow trees and historic wooden machiya.",
            sort_order=1,
            pacing_tag="moderate",
            accessibility_note="Paved level surface",
        )
        a3 = DBActivity(
            id=str(uuid.uuid4()),
            day_id=day1_id,
            title="Shojin Ryori Buddhist Vegan Dinner",
            category="food",
            start_time="18:30",
            end_time="20:30",
            location="Higashiyama, Kyoto",
            estimated_cost=55.0,
            currency="USD",
            notes="Traditional temple multicourse cuisine strictly plant-based.",
            sort_order=2,
            pacing_tag="moderate",
            dietary_note="Vegetarian / Vegan certified",
        )
        db.add_all([a1, a2, a3])

        # Day 2
        d2 = DBItineraryDay(
            id=day2_id,
            trip_id=t1_id,
            day_number=2,
            date="2026-11-11",
            title="Arashiyama Bamboo & Zen Stone Gardens",
            theme="Nature & Culture • Moderate",
            notes="Breathtaking morning light at Tenryu-ji followed by serene river views.",
        )
        db.add(d2)
        db.flush()

        a4 = DBActivity(
            id=str(uuid.uuid4()),
            day_id=day2_id,
            title="Tenryu-ji Zen Temple & Arashiyama Bamboo Grove",
            category="nature",
            start_time="09:00",
            end_time="11:30",
            location="Arashiyama, Kyoto",
            estimated_cost=8.0,
            currency="USD",
            notes="World heritage Sogenchi Garden; wide paved viewing decks.",
            sort_order=0,
            pacing_tag="moderate",
            accessibility_note="Ramps available at main temple veranda",
        )
        a5 = DBActivity(
            id=str(uuid.uuid4()),
            day_id=day2_id,
            title="Matcha & Tofu Kaiseki Lunch",
            category="food",
            start_time="12:00",
            end_time="13:30",
            location="Arashiyama Riverside",
            estimated_cost=35.0,
            currency="USD",
            notes="Fresh yuba and artisanal sesame tofu overlooking the Oi River.",
            sort_order=1,
            pacing_tag="moderate",
            dietary_note="Vegetarian verified",
        )
        a6 = DBActivity(
            id=str(uuid.uuid4()),
            day_id=day2_id,
            title="Kinkaku-ji (Golden Pavilion) Visit",
            category="culture",
            start_time="15:00",
            end_time="16:45",
            location="Kita Ward, Kyoto",
            estimated_cost=6.0,
            currency="USD",
            notes="Iconic gold leaf temple reflecting on Mirror Pond.",
            sort_order=2,
            pacing_tag="moderate",
            accessibility_note="Step-free circular walkway",
        )
        db.add_all([a4, a5, a6])
        db.commit()

    def _to_response(self, trip: DBTrip) -> TripResponse:
        days: List[ItineraryDaySchema] = []
        for d in trip.itinerary_days:
            acts: List[ActivitySchema] = []
            for a in d.activities:
                acts.append(
                    ActivitySchema(
                        id=a.id,
                        day_id=a.day_id,
                        title=a.title,
                        category=a.category,
                        start_time=a.start_time,
                        end_time=a.end_time,
                        location=a.location,
                        estimated_cost=a.estimated_cost,
                        currency=a.currency or trip.currency,
                        notes=a.notes,
                        sort_order=a.sort_order,
                        pacing_tag=a.pacing_tag,
                        accessibility_note=a.accessibility_note,
                        dietary_note=a.dietary_note,
                    )
                )
            days.append(
                ItineraryDaySchema(
                    id=d.id,
                    trip_id=d.trip_id,
                    day_number=d.day_number,
                    date=d.date,
                    title=d.title,
                    theme=d.theme,
                    notes=d.notes,
                    activities=acts,
                )
            )

        pref_data = trip.preferences if isinstance(trip.preferences, dict) else {}
        pref = TravelPreferencesSchema(
            travel_style=pref_data.get("travel_style", "mixed"),
            pacing=pref_data.get("pacing", "moderate"),
            budget_level=pref_data.get("budget_level", "moderate"),
            interests=pref_data.get("interests", []),
            dietary_restrictions=pref_data.get("dietary_restrictions", []),
            mobility_concerns=pref_data.get("mobility_concerns", []),
            special_requests=pref_data.get("special_requests"),
        )

        return TripResponse(
            id=trip.id,
            user_id=trip.user_id,
            title=trip.title,
            destination=trip.destination,
            country=trip.country,
            start_date=trip.start_date,
            end_date=trip.end_date,
            travelers_count=trip.travelers_count,
            budget_amount=trip.budget_amount,
            currency=trip.currency,
            status=trip.status,
            notes=trip.notes,
            preferences=pref,
            created_at=trip.created_at.isoformat() if isinstance(trip.created_at, datetime) else str(trip.created_at),
            updated_at=trip.updated_at.isoformat() if isinstance(trip.updated_at, datetime) else str(trip.updated_at),
            itinerary_days=days,
        )

    def get_all(self, user_id: Optional[str] = None) -> List[TripResponse]:
        db = self._get_db()
        try:
            query = db.query(DBTrip)
            if user_id and user_id != "all":
                # Include both user's trips and shared demo trips
                query = query.filter((DBTrip.user_id == user_id) | (DBTrip.user_id == "demo-user"))
            trips = query.order_by(DBTrip.created_at.desc()).all()
            return [self._to_response(t) for t in trips]
        finally:
            db.close()

    def get_by_id(self, trip_id: str) -> Optional[TripResponse]:
        db = self._get_db()
        try:
            trip = db.query(DBTrip).filter(DBTrip.id == trip_id).first()
            if not trip:
                return None
            return self._to_response(trip)
        finally:
            db.close()

    def create(self, req: TripCreateRequest) -> TripResponse:
        db = self._get_db()
        try:
            user_id = req.user_id or "guest-user"
            self._ensure_user_profile(db, user_id)

            trip_id = str(uuid.uuid4())
            now = datetime.utcnow()

            db_trip = DBTrip(
                id=trip_id,
                user_id=user_id,
                title=req.title,
                destination=req.destination,
                country=req.country,
                start_date=req.start_date,
                end_date=req.end_date,
                travelers_count=req.travelers_count,
                budget_amount=req.budget_amount,
                currency=req.currency,
                status="planning",
                notes=None,
                preferences=req.preferences.model_dump(),
                created_at=now,
                updated_at=now,
            )
            db.add(db_trip)
            db.commit()
            db.refresh(db_trip)
            return self._to_response(db_trip)
        finally:
            db.close()

    def update(self, trip_id: str, patch: TripUpdateRequest) -> Optional[TripResponse]:
        db = self._get_db()
        try:
            trip = db.query(DBTrip).filter(DBTrip.id == trip_id).first()
            if not trip:
                return None

            update_data = patch.model_dump(exclude_unset=True)
            for field, val in update_data.items():
                if field == "preferences" and val is not None:
                    trip.preferences = val
                elif hasattr(trip, field) and val is not None:
                    setattr(trip, field, val)
            trip.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(trip)
            return self._to_response(trip)
        finally:
            db.close()

    def delete(self, trip_id: str) -> bool:
        db = self._get_db()
        try:
            trip = db.query(DBTrip).filter(DBTrip.id == trip_id).first()
            if not trip:
                return False
            db.delete(trip)
            db.commit()
            return True
        finally:
            db.close()

    def set_itinerary(self, trip_id: str, days: List[ItineraryDaySchema]) -> Optional[TripResponse]:
        db = self._get_db()
        try:
            trip = db.query(DBTrip).filter(DBTrip.id == trip_id).first()
            if not trip:
                return None

            # Remove existing days and activities (cascade will delete activities)
            db.query(DBItineraryDay).filter(DBItineraryDay.trip_id == trip_id).delete()
            db.flush()

            # Insert new days and activities
            for d in days:
                day_id = d.id or str(uuid.uuid4())
                db_day = DBItineraryDay(
                    id=day_id,
                    trip_id=trip_id,
                    day_number=d.day_number,
                    date=d.date,
                    title=d.title,
                    theme=d.theme,
                    notes=d.notes,
                )
                db.add(db_day)
                db.flush()

                for a in d.activities:
                    act_id = a.id or str(uuid.uuid4())
                    db_act = DBActivity(
                        id=act_id,
                        day_id=day_id,
                        title=a.title,
                        category=a.category,
                        start_time=a.start_time,
                        end_time=a.end_time,
                        location=a.location,
                        estimated_cost=a.estimated_cost or 0.0,
                        currency=a.currency or trip.currency,
                        notes=a.notes,
                        sort_order=a.sort_order,
                        pacing_tag=a.pacing_tag,
                        accessibility_note=a.accessibility_note,
                        dietary_note=a.dietary_note,
                    )
                    db.add(db_act)

            trip.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(trip)
            return self._to_response(trip)
        finally:
            db.close()

    def add_activity(self, trip_id: str, day_id: str, input_data: ActivityCreateInput) -> Optional[ActivitySchema]:
        db = self._get_db()
        try:
            day = db.query(DBItineraryDay).filter(DBItineraryDay.id == day_id).first()
            if not day:
                return None

            act_id = str(uuid.uuid4())
            trip = day.trip
            sort_order = input_data.sort_order if input_data.sort_order is not None else len(day.activities)

            db_act = DBActivity(
                id=act_id,
                day_id=day_id,
                title=input_data.title,
                category=input_data.category,
                start_time=input_data.start_time,
                end_time=input_data.end_time,
                location=input_data.location,
                estimated_cost=input_data.estimated_cost or 0.0,
                currency=trip.currency if trip else "USD",
                notes=input_data.notes,
                sort_order=sort_order,
            )
            db.add(db_act)
            if trip:
                trip.updated_at = datetime.utcnow()
            db.commit()

            return ActivitySchema(
                id=act_id,
                day_id=day_id,
                title=db_act.title,
                category=db_act.category,
                start_time=db_act.start_time,
                end_time=db_act.end_time,
                location=db_act.location,
                estimated_cost=db_act.estimated_cost,
                currency=db_act.currency,
                notes=db_act.notes,
                sort_order=db_act.sort_order,
            )
        finally:
            db.close()

    def delete_activity(self, trip_id: str, activity_id: str) -> bool:
        db = self._get_db()
        try:
            act = db.query(DBActivity).filter(DBActivity.id == activity_id).first()
            if not act:
                return False
            db.delete(act)
            trip = db.query(DBTrip).filter(DBTrip.id == trip_id).first()
            if trip:
                trip.updated_at = datetime.utcnow()
            db.commit()
            return True
        finally:
            db.close()

    def update_activity(
        self, trip_id: str, activity_id: str, patch: ActivityUpdateRequest
    ) -> Optional[ActivitySchema]:
        db = self._get_db()
        try:
            act = db.query(DBActivity).filter(DBActivity.id == activity_id).first()
            if not act:
                return None

            if patch.title is not None:
                act.title = patch.title
            if patch.category is not None:
                act.category = patch.category
            if patch.start_time is not None:
                act.start_time = patch.start_time
            if patch.end_time is not None:
                act.end_time = patch.end_time
            if patch.location is not None:
                act.location = patch.location
            if patch.estimated_cost is not None:
                act.estimated_cost = patch.estimated_cost
            if patch.currency is not None:
                act.currency = patch.currency
            if patch.notes is not None:
                act.notes = patch.notes
            if patch.sort_order is not None:
                act.sort_order = patch.sort_order
            if patch.pacing_tag is not None:
                act.pacing_tag = patch.pacing_tag
            if patch.accessibility_note is not None:
                act.accessibility_note = patch.accessibility_note
            if patch.dietary_note is not None:
                act.dietary_note = patch.dietary_note

            trip = db.query(DBTrip).filter(DBTrip.id == trip_id).first()
            if trip:
                trip.updated_at = datetime.utcnow()

            db.commit()
            db.refresh(act)

            return ActivitySchema(
                id=act.id,
                day_id=act.day_id,
                title=act.title,
                category=act.category,
                start_time=act.start_time,
                end_time=act.end_time,
                location=act.location,
                estimated_cost=act.estimated_cost,
                currency=act.currency,
                notes=act.notes,
                sort_order=act.sort_order,
                pacing_tag=act.pacing_tag,
                accessibility_note=act.accessibility_note,
                dietary_note=act.dietary_note,
            )
        finally:
            db.close()

    def get_profile(self, user_id: str) -> ProfileResponse:
        db = self._get_db()
        try:
            self._ensure_user_profile(db, user_id)
            prof = db.query(DBProfile).filter(DBProfile.id == user_id).first()
            interests = prof.interests if isinstance(prof.interests, list) else []
            return ProfileResponse(
                id=prof.id,
                email=prof.email,
                full_name=prof.full_name,
                home_city=prof.home_city,
                travel_style=prof.travel_style or "mixed",
                budget_level=prof.budget_level or "moderate",
                interests=interests,
                dietary_notes=prof.dietary_notes,
                created_at=prof.created_at.isoformat() if isinstance(prof.created_at, datetime) else str(prof.created_at),
                updated_at=prof.updated_at.isoformat() if isinstance(prof.updated_at, datetime) else str(prof.updated_at),
            )
        finally:
            db.close()

    def update_profile(self, user_id: str, patch: ProfileUpdateRequest) -> ProfileResponse:
        db = self._get_db()
        try:
            self._ensure_user_profile(db, user_id)
            prof = db.query(DBProfile).filter(DBProfile.id == user_id).first()

            if patch.full_name is not None:
                prof.full_name = patch.full_name
            if patch.home_city is not None:
                prof.home_city = patch.home_city
            if patch.travel_style is not None:
                prof.travel_style = patch.travel_style
            if patch.budget_level is not None:
                prof.budget_level = patch.budget_level
            if patch.interests is not None:
                prof.interests = patch.interests
            if patch.dietary_notes is not None:
                prof.dietary_notes = patch.dietary_notes

            prof.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(prof)

            interests = prof.interests if isinstance(prof.interests, list) else []
            return ProfileResponse(
                id=prof.id,
                email=prof.email,
                full_name=prof.full_name,
                home_city=prof.home_city,
                travel_style=prof.travel_style or "mixed",
                budget_level=prof.budget_level or "moderate",
                interests=interests,
                dietary_notes=prof.dietary_notes,
                created_at=prof.created_at.isoformat() if isinstance(prof.created_at, datetime) else str(prof.created_at),
                updated_at=prof.updated_at.isoformat() if isinstance(prof.updated_at, datetime) else str(prof.updated_at),
            )
        finally:
            db.close()




# Singleton instance
trip_service = TripService()

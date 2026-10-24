from typing import List
from ..models.schemas import (
    TripResponse,
    ItineraryDaySchema,
    ItineraryGenerateRequest,
    TravelPreferencesSchema,
)
from .ai_service import AIService
from .trip_service import trip_service
from .history_service import history_service
from .prompt_builder import PromptBuilder


class ItineraryService:
    @classmethod
    async def generate_for_trip(cls, trip_id: str) -> TripResponse:
        trip = trip_service.get_by_id(trip_id)
        if not trip:
            raise ValueError(f"Trip with id {trip_id} not found")

        days = await AIService.generate_itinerary(
            destination=trip.destination,
            country=trip.country,
            start_date=trip.start_date,
            end_date=trip.end_date,
            travelers_count=trip.travelers_count,
            budget_amount=trip.budget_amount,
            currency=trip.currency,
            preferences=trip.preferences,
        )

        updated_trip = trip_service.set_itinerary(trip_id, days)
        if not updated_trip:
            raise RuntimeError("Failed to update trip with generated itinerary")

        # Record history
        summary = (
            f"Generated {len(days)} days for {trip.destination}. "
            f"Pacing: {trip.preferences.pacing}, Style: {trip.preferences.travel_style}."
        )
        history_service.record_generation(
            trip_id=trip.id,
            destination=trip.destination,
            title=trip.title,
            days_count=len(days),
            model_used="gemini-1.5-flash" if AIService._generate_with_gemini else "daytrail-ai-engine",
            summary=summary,
        )

        return updated_trip

    @classmethod
    async def generate_direct(cls, req: ItineraryGenerateRequest) -> List[ItineraryDaySchema]:
        days = await AIService.generate_itinerary(
            destination=req.destination,
            country=req.country,
            start_date=req.start_date,
            end_date=req.end_date,
            travelers_count=req.travelers_count,
            budget_amount=req.budget_amount,
            currency=req.currency,
            preferences=req.preferences,
        )
        return days


itinerary_service = ItineraryService()

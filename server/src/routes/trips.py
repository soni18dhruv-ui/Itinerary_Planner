from typing import Optional
from fastapi import APIRouter, HTTPException, status
from ..models.schemas import (
    TripCreateRequest,
    TripUpdateRequest,
    TripResponse,
    TripListResponse,
    ActivityCreateInput,
    ActivityUpdateRequest,
    ActivitySchema,
)
from ..services.trip_service import trip_service
from ..services.itinerary_service import itinerary_service

router = APIRouter(prefix="/api/trips", tags=["trips"])


@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def create_trip(req: TripCreateRequest):
    """
    Creates a new trip record and optionally triggers AI itinerary generation.
    """
    trip = trip_service.create(req)
    if req.generate:
        try:
            trip = await itinerary_service.generate_for_trip(trip.id)
        except Exception as e:
            # Trip is still created even if AI generation had a glitch
            print(f"Warning: Itinerary generation error: {e}")
    return trip


@router.get("", response_model=TripListResponse)
def get_trips(user_id: Optional[str] = None):
    """
    Retrieves all trips, optionally filtered by user ID.
    """
    trips = trip_service.get_all(user_id=user_id)
    return TripListResponse(trips=trips, total=len(trips))


@router.get("/{trip_id}", response_model=TripResponse)
def get_trip(trip_id: str):
    """
    Retrieves a single trip by ID with all itinerary days and activities.
    """
    trip = trip_service.get_by_id(trip_id)
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with ID {trip_id} not found",
        )
    return trip


@router.put("/{trip_id}", response_model=TripResponse)
def update_trip(trip_id: str, patch: TripUpdateRequest):
    """
    Updates trip properties (e.g., status, budget, notes).
    """
    updated = trip_service.update(trip_id, patch)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with ID {trip_id} not found",
        )
    return updated


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(trip_id: str):
    """
    Deletes a trip by ID.
    """
    deleted = trip_service.delete(trip_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with ID {trip_id} not found",
        )
    return None


@router.post("/{trip_id}/generate", response_model=TripResponse)
async def generate_trip_itinerary(trip_id: str):
    """
    Triggers or regenerates the AI itinerary for an existing trip.
    """
    try:
        updated = await itinerary_service.generate_for_trip(trip_id)
        return updated
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{trip_id}/days/{day_id}/activities", response_model=ActivitySchema, status_code=status.HTTP_201_CREATED)
def add_activity(trip_id: str, day_id: str, act_input: ActivityCreateInput):
    """
    Adds a custom activity to a specific day in the trip itinerary.
    """
    activity = trip_service.add_activity(trip_id, day_id, act_input)
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Could not add activity to trip {trip_id} day {day_id}",
        )
    return activity


@router.put("/{trip_id}/activities/{activity_id}", response_model=ActivitySchema)
def update_activity(trip_id: str, activity_id: str, patch: ActivityUpdateRequest):
    """
    Updates an activity within a trip's itinerary.
    """
    updated = trip_service.update_activity(trip_id, activity_id, patch)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Activity {activity_id} not found in trip {trip_id}",
        )
    return updated


@router.delete("/{trip_id}/activities/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(trip_id: str, activity_id: str):
    """
    Deletes an activity from an itinerary day.
    """
    success = trip_service.delete_activity(trip_id, activity_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Activity {activity_id} not found in trip {trip_id}",
        )
    return None


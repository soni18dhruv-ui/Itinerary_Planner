from fastapi import APIRouter, HTTPException, status
from ..models.schemas import ProfileResponse, ProfileUpdateRequest
from ..services.trip_service import trip_service

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("/{user_id}", response_model=ProfileResponse)
def get_profile(user_id: str):
    """
    Retrieves the traveler profile and preferences from MySQL.
    """
    try:
        return trip_service.get_profile(user_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not fetch profile: {e}",
        )


@router.put("/{user_id}", response_model=ProfileResponse)
def update_profile(user_id: str, patch: ProfileUpdateRequest):
    """
    Updates traveler profile preferences in MySQL.
    """
    try:
        return trip_service.update_profile(user_id, patch)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not update profile: {e}",
        )

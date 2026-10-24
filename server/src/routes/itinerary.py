from typing import List
from fastapi import APIRouter, HTTPException, status
from ..models.schemas import (
    ItineraryDaySchema,
    ItineraryGenerateRequest,
    PromptPreviewRequest,
    PromptPreviewResponse,
)
from ..services.prompt_builder import PromptBuilder
from ..services.itinerary_service import itinerary_service

router = APIRouter(prefix="/api/itinerary", tags=["itinerary"])


@router.post("/preview-prompt", response_model=PromptPreviewResponse)
def preview_ai_prompt(req: PromptPreviewRequest):
    """
    Constructs and previews the exact dynamic AI prompt, personalization rules,
    pacing logic, dietary guidelines, and accessibility constraints.
    """
    preview = PromptBuilder.generate_preview(
        destination=req.destination,
        country=req.country,
        start_date=req.start_date,
        end_date=req.end_date,
        travelers_count=req.travelers_count,
        budget_amount=req.budget_amount,
        currency=req.currency,
        preferences=req.preferences,
    )
    return preview


@router.post("/generate", response_model=List[ItineraryDaySchema])
async def generate_itinerary_standalone(req: ItineraryGenerateRequest):
    """
    Directly generates a structured day-by-day itinerary without saving a trip first.
    """
    try:
        days = await itinerary_service.generate_direct(req)
        return days
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate itinerary: {e}",
        )

from typing import List
from fastapi import APIRouter
from ..models.schemas import HistoryItemSchema
from ..services.history_service import history_service

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("", response_model=List[HistoryItemSchema])
def get_history():
    """
    Returns recent AI itinerary generation events and history.
    """
    return history_service.get_all()

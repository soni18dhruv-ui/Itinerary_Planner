import uuid
from datetime import datetime
from typing import List
from ..database import SessionLocal
from ..models.db_models import DBHistory
from ..models.schemas import HistoryItemSchema


class HistoryService:
    def _get_db(self):
        return SessionLocal()

    def record_generation(
        self,
        trip_id: str,
        destination: str,
        title: str,
        days_count: int,
        model_used: str,
        summary: str,
    ) -> HistoryItemSchema:
        db = self._get_db()
        try:
            item_id = str(uuid.uuid4())
            now_str = datetime.utcnow().isoformat() + "Z"
            db_item = DBHistory(
                id=item_id,
                trip_id=trip_id,
                destination=destination,
                title=title,
                days_count=days_count,
                generated_at=now_str,
                model_used=model_used,
                summary=summary,
            )
            db.add(db_item)
            db.commit()

            return HistoryItemSchema(
                id=item_id,
                trip_id=trip_id,
                destination=destination,
                title=title,
                days_count=days_count,
                generated_at=now_str,
                model_used=model_used,
                summary=summary,
            )
        finally:
            db.close()

    def get_all(self) -> List[HistoryItemSchema]:
        db = self._get_db()
        try:
            records = db.query(DBHistory).order_by(DBHistory.generated_at.desc()).limit(50).all()
            return [
                HistoryItemSchema(
                    id=r.id,
                    trip_id=r.trip_id,
                    destination=r.destination,
                    title=r.title,
                    days_count=r.days_count,
                    generated_at=r.generated_at,
                    model_used=r.model_used,
                    summary=r.summary or "",
                )
                for r in records
            ]
        finally:
            db.close()


history_service = HistoryService()

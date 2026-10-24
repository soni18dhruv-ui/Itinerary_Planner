import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .config.settings import settings

logger = logging.getLogger(__name__)

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Creates all MySQL database tables if they do not exist.
    """
    try:
        from .models import db_models  # noqa: F401
        Base.metadata.create_all(bind=engine)
        logger.info("MySQL database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing MySQL database: {e}")
        raise e

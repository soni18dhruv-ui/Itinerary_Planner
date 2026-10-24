from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from .config.settings import settings
from .database import init_db, engine
from .routes.trips import router as trips_router
from .routes.itinerary import router as itinerary_router
from .routes.history import router as history_router
from .routes.profile import router as profile_router
from .routes.auth import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize MySQL tables on startup
    init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Intelligent AI Travel Itinerary Planner with MySQL Persistence, Pacing, Accessibility & Dietary Directives.",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware for seamless communication with React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth_router)
app.include_router(trips_router)
app.include_router(itinerary_router)
app.include_router(history_router)
app.include_router(profile_router)




@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.app_name,
        "version": settings.app_version,
        "database": "MySQL (travel_planner)",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    # Verify MySQL connection
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {e}"

    return {
        "status": "healthy",
        "database": "MySQL",
        "db_connection": db_status,
    }

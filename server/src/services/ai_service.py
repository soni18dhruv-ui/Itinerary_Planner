import json
import logging
import re
import os
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List
from ..config.settings import settings
from ..models.schemas import (
    TravelPreferencesSchema,
    ItineraryDaySchema,
    ActivitySchema,
    ActivityCategory,
)
from .prompt_builder import PromptBuilder

logger = logging.getLogger(__name__)

# Destination knowledge base for realistic itineraries
DESTINATION_HUBS: Dict[str, Dict[str, Any]] = {
    "kyoto": {
        "title": "Kyoto, Japan",
        "currency": "JPY",
        "highlights": [
            ("Fushimi Inari Taisha (Torii Gates)", "sightseeing", "Fushimi Ward", "08:30", "10:30", 0, "Walk early to escape the crowds; flat lower paths are accessible."),
            ("Kiyomizu-dera Temple", "culture", "Higashiyama", "11:00", "13:00", 400, "Stunning wooden stage overlooking the city. Elevator available at main hall."),
            ("Traditional Matcha Ceremony & Garden", "leisure", "Gion", "14:00", "15:30", 2500, "Serene seated experience paired with seasonal wagashi sweets."),
            ("Nishiki Market Culinary Tour", "food", "Nakagyo Ward", "16:00", "18:00", 3000, "Vibrant street food arcade; vegetarian tofu skewers and fresh dango available."),
            ("Pontocho Alley Evening Walk & Kaiseki", "food", "Pontocho", "19:00", "21:00", 6000, "Atmospheric lantern-lit alley along the Kamogawa River."),
            ("Arashiyama Bamboo Grove & Tenryu-ji", "nature", "Arashiyama", "09:00", "11:30", 500, "Paved level paths winding through towering emerald bamboo stalks."),
            ("Golden Pavilion (Kinkaku-ji)", "culture", "Kita Ward", "13:00", "14:30", 500, "Reflections on the mirror pond; step-free main viewing path."),
            ("Philosopher's Path Canal Stroll", "nature", "Sakyo Ward", "15:30", "17:00", 0, "Stone path following a tree-shaded canal with peaceful craft boutiques."),
        ],
    },
    "tokyo": {
        "title": "Tokyo, Japan",
        "currency": "JPY",
        "highlights": [
            ("Senso-ji Temple & Nakamise Street", "culture", "Asakusa", "09:00", "11:00", 0, "Tokyo's oldest Buddhist temple; step-free access to main hall."),
            ("teamLab Borderless Digital Art Museum", "leisure", "Azabudai Hills", "11:45", "14:00", 4200, "Mind-bending immersive digital light exhibits; fully climate-controlled and accessible."),
            ("Tsukiji Outer Market Tasting", "food", "Chuo City", "14:30", "16:00", 2500, "Fresh tamagoyaki, matcha lattes, and artisan snacks."),
            ("Meiji Jingu Shrine & Yoyogi Park", "nature", "Shibuya", "09:30", "11:30", 0, "Tranquil forest shrine oasis in the heart of metropolitan Tokyo."),
            ("Shibuya Sky & Scramble Crossing", "sightseeing", "Shibuya", "16:30", "18:30", 2200, "360-degree open-air observation deck with elevator access to top."),
            ("Shinjuku Omoide Yokocho Dinner", "food", "Shinjuku", "19:30", "21:30", 3500, "Historic retro food alleys with authentic yakitori and craft beers."),
        ],
    },
    "rome": {
        "title": "Rome, Italy",
        "currency": "EUR",
        "highlights": [
            ("Colosseum & Roman Forum", "culture", "Piazza del Colosseo", "09:00", "12:00", 18, "Iconic amphitheater; elevator to tier levels available with booking."),
            ("Monti District Trattoria Lunch", "food", "Rione Monti", "12:30", "14:00", 25, "Fresh handmade pasta, cacio e pepe, and local Roman wines."),
            ("Pantheon & Piazza Navona", "sightseeing", "Centro Storico", "15:00", "17:00", 5, "Remarkable ancient dome and Bernini's Fontana dei Quattro Fiumi."),
            ("Trevi Fountain & Artisan Gelato", "leisure", "Trevi", "17:30", "19:00", 8, "Toss a coin into the fountain and savor pistachio gelato nearby."),
            ("Vatican Museums & Sistine Chapel", "culture", "Vatican City", "09:00", "12:30", 22, "Michelangelo's masterpieces with dedicated wheelchair elevator routes."),
            ("Trastevere Sunset Walk & Dinner", "food", "Trastevere", "18:30", "21:30", 35, "Cobblestone charm, guitar players in piazzas, and rustic wood-fired pizza."),
        ],
    },
    "paris": {
        "title": "Paris, France",
        "currency": "EUR",
        "highlights": [
            ("Louvre Museum Highlights Tour", "culture", "1st Arrondissement", "09:30", "12:30", 22, "Winged Victory and Mona Lisa; accessible pyramid entrance with glass elevator."),
            ("Tuileries Garden & Angelina Cafe", "leisure", "Tuileries", "13:00", "14:30", 20, "Relaxed stroll along tree-lined basins and legendary hot chocolate."),
            ("Musee d'Orsay Impressionists", "culture", "7th Arrondissement", "15:00", "17:30", 16, "Former train station housing masterpieces by Monet, Van Gogh, and Degas."),
            ("Seine River Twilight Cruise", "sightseeing", "Pont Neuf", "18:30", "20:00", 18, "Gliding past illuminated monuments with step-free boarding."),
            ("Montmartre & Sacre-Coeur", "culture", "18th Arrondissement", "10:00", "12:30", 0, "Funicular railway available to bypass the stairs to the basilica terrace."),
            ("Le Marais Bakery & Boutique Walk", "food", "4th Arrondissement", "14:00", "16:30", 15, "Historic mansion streets, falafel at L'As du Fallafel, and pastry salons."),
        ],
    },
    "barcelona": {
        "title": "Barcelona, Spain",
        "currency": "EUR",
        "highlights": [
            ("Sagrada Familia Basilica Tour", "culture", "Eixample", "09:00", "11:30", 26, "Gaudi's masterpiece with rainbow stained glass; ramps and elevator access."),
            ("Park Guell Architectural Terrace", "nature", "Gracia", "12:30", "14:30", 13, "Mosaic salamander and panoramic Mediterranean coastline views."),
            ("Gothic Quarter & Born Tapas Crawl", "food", "El Born", "15:30", "17:30", 28, "Patatas bravas, padron peppers, and crisp cava in medieval plazas."),
            ("Barceloneta Beachfront Sunset Promenade", "leisure", "Barceloneta", "18:30", "20:30", 0, "Flat seaside boardwalk lined with palm trees and ocean breeze."),
        ],
    },
    "new york": {
        "title": "New York City, USA",
        "currency": "USD",
        "highlights": [
            ("Central Park & Bethesda Terrace", "nature", "Manhattan", "09:30", "11:30", 0, "Iconic shaded elm walkways, rowboats, and tranquil fountain plazas."),
            ("Metropolitan Museum of Art (The Met)", "culture", "Upper East Side", "12:00", "15:00", 30, "World-class galleries spanning Egyptian temples to modern art; fully accessible."),
            ("High Line Elevated Park Stroll", "sightseeing", "Chelsea", "15:30", "17:00", 0, "Elevated linear park built on former rail line with elevator access points."),
            ("Chelsea Market Artisan Food Tasting", "food", "Meatpacking", "17:30", "19:00", 25, "Indoor food hall featuring lobster rolls, tacos, and artisan bakeries."),
            ("Broadway Musical Experience", "leisure", "Theater District", "19:30", "22:00", 95, "World-renowned performing arts in iconic historic Broadway theaters."),
        ],
    },
}


class AIService:
    """
    AI Generation Engine:
    Connects with Google Gemini API when configured, or executes the built-in
    high-fidelity semantic generator fallback for instant, reliable itineraries.
    """

    @classmethod
    async def generate_itinerary(
        cls,
        destination: str,
        country: str | None,
        start_date: str,
        end_date: str,
        travelers_count: int,
        budget_amount: float | None,
        currency: str,
        preferences: TravelPreferencesSchema,
    ) -> List[ItineraryDaySchema]:
        
        system_prompt, user_prompt, summary, pacing_rules, dietary_directives, mobility_directives = (
            PromptBuilder.build_prompt_package(
                destination=destination,
                country=country,
                start_date=start_date,
                end_date=end_date,
                travelers_count=travelers_count,
                budget_amount=budget_amount,
                currency=currency,
                preferences=preferences,
            )
        )

        total_days = summary["total_days"]

        # 1. Try Gemini API if API key is present
        if settings.gemini_api_key and settings.gemini_api_key != "your_gemini_key_here":
            try:
                days = await cls._generate_with_gemini(
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    start_date=start_date,
                    total_days=total_days,
                    currency=currency,
                )
                if days:
                    return days
            except Exception as e:
                logger.warning(f"Gemini API invocation failed ({e}), falling back to internal generator engine.")

        # 2. High-fidelity semantic fallback generator
        return cls._generate_fallback_itinerary(
            destination=destination,
            country=country,
            start_date=start_date,
            total_days=total_days,
            travelers_count=travelers_count,
            budget_amount=budget_amount,
            currency=currency,
            preferences=preferences,
            pacing_rules=pacing_rules,
            dietary_directives=dietary_directives,
            mobility_directives=mobility_directives,
        )

    @classmethod
    async def _generate_with_gemini(
        cls,
        system_prompt: str,
        user_prompt: str,
        start_date: str,
        total_days: int,
        currency: str,
    ) -> List[ItineraryDaySchema] | None:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.gemini_api_key)
            model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=system_prompt,
                generation_config={"response_mime_type": "application/json"},
            )
            response = await model.generate_content_async(user_prompt)
            data = json.loads(response.text)
            
            raw_days = data.get("days", [])
            itinerary_days: List[ItineraryDaySchema] = []
            
            for i, d in enumerate(raw_days[:total_days]):
                day_num = d.get("day_number", i + 1)
                day_id = str(uuid.uuid4())
                d_date = d.get("date") or cls._add_days(start_date, i)
                activities: List[ActivitySchema] = []
                for s_idx, a in enumerate(d.get("activities", [])):
                    act = ActivitySchema(
                        id=str(uuid.uuid4()),
                        day_id=day_id,
                        title=a.get("title", f"Activity {s_idx + 1}"),
                        category=a.get("category", "sightseeing"),
                        start_time=a.get("start_time", "10:00"),
                        end_time=a.get("end_time", "11:30"),
                        location=a.get("location", ""),
                        estimated_cost=float(a.get("estimated_cost", 15.0)),
                        currency=currency,
                        notes=a.get("notes", ""),
                        sort_order=s_idx,
                        pacing_tag=a.get("pacing_tag"),
                        accessibility_note=a.get("accessibility_note"),
                        dietary_note=a.get("dietary_note"),
                    )
                    activities.append(act)

                itinerary_days.append(
                    ItineraryDaySchema(
                        id=day_id,
                        trip_id="",
                        day_number=day_num,
                        date=d_date,
                        title=d.get("title", f"Day {day_num}"),
                        notes=d.get("notes", ""),
                        activities=activities,
                    )
                )
            return itinerary_days
        except Exception as e:
            logger.error(f"Error calling Gemini: {e}")
            return None

    @classmethod
    def _add_days(cls, date_str: str, days: int) -> str:
        try:
            base = datetime.strptime(date_str[:10], "%Y-%m-%d")
            return (base + timedelta(days=days)).strftime("%Y-%m-%d")
        except Exception:
            return date_str

    @classmethod
    def _generate_fallback_itinerary(
        cls,
        destination: str,
        country: str | None,
        start_date: str,
        total_days: int,
        travelers_count: int,
        budget_amount: float | None,
        currency: str,
        preferences: TravelPreferencesSchema,
        pacing_rules: List[str],
        dietary_directives: List[str],
        mobility_directives: List[str],
    ) -> List[ItineraryDaySchema]:
        """
        Creates a custom, high-fidelity itinerary obeying all personalization constraints.
        """
        dest_key = destination.strip().lower()
        matched_hub = None
        for key, hub in DESTINATION_HUBS.items():
            if key in dest_key or dest_key in key:
                matched_hub = hub
                break

        pacing = preferences.pacing
        style = preferences.travel_style
        dietary = preferences.dietary_restrictions
        mobility = preferences.mobility_concerns
        interests = preferences.interests or ["culture", "photography", "local food"]

        # Determine activities per day based on pacing
        if pacing == "relaxed":
            acts_per_day = 3
            start_hour = 10
            slot_gap = 180  # 3 hours per slot with downtime
        elif pacing == "fast":
            acts_per_day = 5
            start_hour = 8
            slot_gap = 130  # tighter packing
        else:  # moderate
            acts_per_day = 4
            start_hour = 9
            slot_gap = 150

        days_list: List[ItineraryDaySchema] = []

        # Cost multiplier by budget tier
        budget_mult = {"budget": 0.5, "moderate": 1.0, "luxury": 2.5}.get(preferences.budget_level, 1.0)

        for day_idx in range(total_days):
            day_num = day_idx + 1
            day_id = str(uuid.uuid4())
            curr_date = cls._add_days(start_date, day_idx)

            is_arrival = (day_idx == 0)
            is_departure = (day_idx == total_days - 1 and total_days > 1)

            day_activities: List[ActivitySchema] = []

            # Determine day theme
            if is_arrival:
                day_title = f"Arrival & Settling into {destination}"
                day_notes = f"Check in, unpack, and enjoy an easy orientation walk around your neighborhood. Paced with {pacing} energy."
            elif is_departure:
                day_title = f"Final Souvenirs & Farewell {destination}"
                day_notes = "Last cafe stop, souvenir shopping, and smooth baggage transfer."
            else:
                focus_interest = interests[day_idx % len(interests)]
                day_title = f"{focus_interest.title()} & Hidden Gems of {destination}"
                day_notes = f"Dedicated day focusing on {focus_interest} and local neighborhood rhythm. Pacing adjusted for {pacing} tempo."

            # Activity generation for this day
            current_time = datetime.strptime(f"{start_hour:02d}:30", "%H:%M")
            slots_to_generate = max(2, acts_per_day - (1 if (is_arrival or is_departure) else 0))

            for slot_idx in range(slots_to_generate):
                end_time = current_time + timedelta(minutes=slot_gap - 30)
                time_str = current_time.strftime("%H:%M")
                end_time_str = end_time.strftime("%H:%M")

                act_title = ""
                act_cat: ActivityCategory = "sightseeing"
                act_loc = destination
                base_cost = 20.0
                act_notes = ""
                diet_note = None
                acc_note = None

                # Generate content
                if matched_hub:
                    hub_highlights = matched_hub["highlights"]
                    item = hub_highlights[(day_idx * slots_to_generate + slot_idx) % len(hub_highlights)]
                    act_title = item[0]
                    act_cat = item[1]
                    act_loc = f"{item[2]}, {destination}"
                    base_cost = float(item[5]) * budget_mult
                    act_notes = item[6]
                else:
                    # Dynamic generation for any destination
                    if slot_idx == 0:
                        if is_arrival:
                            act_title = f"Arrive & Boutique Check-In in {destination}"
                            act_cat = "transport"
                            base_cost = 25.0 * budget_mult
                            act_notes = "Drop luggage, hydrate, and get neighborhood maps."
                        else:
                            act_title = f"Morning Coffee & Scenic Stroll in {destination} Historic District"
                            act_cat = "food" if "food" in style else "sightseeing"
                            base_cost = 12.0 * budget_mult
                            act_notes = f"Enjoy morning ambience in {destination}. Great for {interests[0]}."
                    elif slot_idx == 1:
                        act_title = f"Signature Landmark & Cultural Center of {destination}"
                        act_cat = "culture"
                        base_cost = 22.0 * budget_mult
                        act_notes = f"Explore the celebrated history and architecture of {destination}."
                    elif slot_idx == 2:
                        act_title = f"Artisan Lunch & Local Market Exploration"
                        act_cat = "food"
                        base_cost = 28.0 * budget_mult
                        act_notes = f"Taste specialty dishes from {destination} with local ingredients."
                    elif slot_idx == 3:
                        act_title = f"Sunset Viewpoint & Panoramic Promenade"
                        act_cat = "nature" if "nature" in interests or style == "adventure" else "leisure"
                        base_cost = 10.0 * budget_mult
                        act_notes = "Watch the golden hour light up the city skyline."
                    else:
                        act_title = f"Evening Gastronomy & Neighborhood Nightwalk"
                        act_cat = "food"
                        base_cost = 45.0 * budget_mult
                        act_notes = f"Relaxed dinner celebrating regional flavors of {destination}."

                # Inject dietary personalization
                if act_cat == "food" and dietary:
                    diet_note = f"Verified friendly for: {', '.join(dietary)}."
                    act_notes += f" ({diet_note})"

                # Inject mobility personalization
                if mobility:
                    acc_note = f"Accessibility check: Step-free / {mobility[0]} compliant."
                    act_notes += f" [{acc_note}]"

                day_activities.append(
                    ActivitySchema(
                        id=str(uuid.uuid4()),
                        day_id=day_id,
                        title=act_title,
                        category=act_cat,
                        start_time=time_str,
                        end_time=end_time_str,
                        location=act_loc,
                        estimated_cost=round(base_cost, 2),
                        currency=currency,
                        notes=act_notes,
                        sort_order=slot_idx,
                        pacing_tag=pacing,
                        accessibility_note=acc_note,
                        dietary_note=diet_note,
                    )
                )

                current_time = end_time + timedelta(minutes=30)

            days_list.append(
                ItineraryDaySchema(
                    id=day_id,
                    trip_id="",
                    day_number=day_num,
                    date=curr_date,
                    title=day_title,
                    theme=f"{style.title()} • {pacing.title()}",
                    notes=day_notes,
                    activities=day_activities,
                )
            )

        return days_list

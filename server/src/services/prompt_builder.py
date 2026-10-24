from datetime import datetime
from typing import Dict, Any, List, Tuple
from ..models.schemas import TravelPreferencesSchema, PromptPreviewResponse


class PromptBuilder:
    """
    Prompt Engineering Layer:
    Connects user travel preferences and backend business logic to generate
    highly structured, context-aware instructions for LLM itinerary generation.
    """

    @staticmethod
    def calculate_days(start_date: str, end_date: str) -> int:
        try:
            d1 = datetime.strptime(start_date[:10], "%Y-%m-%d")
            d2 = datetime.strptime(end_date[:10], "%Y-%m-%d")
            days = (d2 - d1).days + 1
            return max(1, min(days, 30))
        except Exception:
            return 3

    @classmethod
    def get_pacing_rules(cls, pacing: str) -> List[str]:
        if pacing == "relaxed":
            return [
                "Cap daily schedule at 2-3 unhurried, high-quality activities.",
                "Gentle morning start at 10:00 AM or later with a relaxed cafe or tea ritual.",
                "Include mandatory 90-minute downtime/buffer in the mid-afternoon for rest, reading, or slow strolling.",
                "Avoid schedule pressure; choose tranquil gardens, scenic lookouts, and leisurely sit-down meals.",
            ]
        elif pacing == "fast":
            return [
                "High-density pacing with 5-6 dynamic activities maximizing daylight and city energy.",
                "Early kickoff at 08:30 AM to reach marquee landmarks ahead of peak crowds.",
                "Optimize geographical routing with minimal transit overhead between consecutive spots.",
                "Include lively evening experiences (night markets, viewpoints, or cultural spectacles).",
            ]
        else:  # moderate (default)
            return [
                "Balanced rhythm with 3-4 curated activities per day.",
                "Morning departure around 09:30 AM balancing iconic highlights with neighborhood charm.",
                "Sensible 45-60 minute buffer between morning and afternoon segments.",
                "Evenings dedicated to memorable local dinners and casual night strolls.",
            ]

    @classmethod
    def get_dietary_directives(cls, restrictions: List[str]) -> List[str]:
        if not restrictions:
            return ["No special dietary restrictions specified. Recommend authentic local regional specialties."]
        
        directives = []
        for r in restrictions:
            r_lower = r.lower()
            if "vegan" in r_lower:
                directives.append("Vegan: Suggest plant-based cafes, dedicated vegan bistros, or dishes inherently free from animal products.")
            elif "vegetarian" in r_lower:
                directives.append("Vegetarian: Ensure restaurants feature rich meat-free menus and highlight celebrated regional veggie dishes.")
            elif "gluten" in r_lower:
                directives.append("Gluten-Free: Avoid cross-contamination hazards; recommend dedicated gluten-free bakeries or naturally GF regional cuisine.")
            elif "halal" in r_lower:
                directives.append("Halal: Feature halal-certified kitchens or seafood-focused regional cuisines with no alcohol/pork in cooking.")
            elif "kosher" in r_lower:
                directives.append("Kosher: Identify certified kosher dining or kosher-friendly vegetarian/vegan spots.")
            elif "nut" in r_lower or "allerg" in r_lower:
                directives.append(f"Allergy Alert ({r}): Explicitly avoid street vendors or dishes with high hidden allergen risks.")
            else:
                directives.append(f"Dietary Requirement ({r}): Verify dining spots can accommodate this specific preference.")
        return directives

    @classmethod
    def get_mobility_directives(cls, mobility_concerns: List[str]) -> List[str]:
        if not mobility_concerns:
            return ["Standard walkability: Average walking distances acceptable."]

        directives = []
        for m in mobility_concerns:
            m_lower = m.lower()
            if "wheelchair" in m_lower:
                directives.append("Wheelchair Accessible: Prioritize venues with step-free entrances, ramps, and elevator access. Avoid steep cobblestone hills.")
            elif "minimal walking" in m_lower or "low endurance" in m_lower:
                directives.append("Minimal Walking: Cluster activities in compact zones; favor hop-on scenic transit, water taxis, or short flat strolls under 500m.")
            elif "stair" in m_lower:
                directives.append("Stair-Free Priority: Avoid viewing towers, hilltop shrines, or metro stations without working elevators.")
            elif "elder" in m_lower or "senior" in m_lower:
                directives.append("Senior-Friendly: Ensure frequent seating/benches, shade, and climate-controlled resting options.")
            else:
                directives.append(f"Mobility Focus ({m}): Route through paved paths and level terrain.")
        return directives

    @classmethod
    def build_prompt_package(
        cls,
        destination: str,
        country: str | None,
        start_date: str,
        end_date: str,
        travelers_count: int,
        budget_amount: float | None,
        currency: str,
        preferences: TravelPreferencesSchema,
    ) -> Tuple[str, str, Dict[str, Any], List[str], List[str], List[str]]:
        
        total_days = cls.calculate_days(start_date, end_date)
        pacing_rules = cls.get_pacing_rules(preferences.pacing)
        dietary_directives = cls.get_dietary_directives(preferences.dietary_restrictions)
        mobility_directives = cls.get_mobility_directives(preferences.mobility_concerns)

        location_str = f"{destination}, {country}" if country else destination
        interests_str = ", ".join(preferences.interests) if preferences.interests else "general sightseeing, photography, and local culture"
        diet_str = ", ".join(preferences.dietary_restrictions) if preferences.dietary_restrictions else "None"
        mobility_str = ", ".join(preferences.mobility_concerns) if preferences.mobility_concerns else "None"
        budget_str = f"{budget_amount} {currency}" if budget_amount else f"{preferences.budget_level.upper()} tier ({currency})"

        system_prompt = (
            "You are Daytrail's Lead Travel Architect & AI Concierge. "
            "You craft deeply personalized, geographically optimized, and culturally vibrant travel itineraries. "
            "You strictly respect user pacing constraints, dietary requirements, and physical mobility needs. "
            "Always return clean, valid JSON strictly adhering to the requested schema."
        )

        user_prompt_lines = [
            f"# TRIP PLANNING MISSION: {location_str.upper()}",
            f"Generate a {total_days}-day comprehensive day-by-day itinerary tailored to the following specifications:",
            "",
            "## TRIP PROFILE",
            f"- Destination: {location_str}",
            f"- Dates: {start_date} to {end_date} ({total_days} total days)",
            f"- Group Size: {travelers_count} person(s)",
            f"- Travel Style: {preferences.travel_style.title()}",
            f"- Activity Pacing: {preferences.pacing.upper()}",
            f"- Budget Level: {preferences.budget_level.title()} (Target: {budget_str})",
            f"- Core Interests: {interests_str}",
            "",
            "## PERSONALIZATION DIRECTIVES",
            "### Pacing & Energy Flow:",
            *[f"  - {rule}" for rule in pacing_rules],
            "",
            "### Dietary & Dining Constraints:",
            f"  - Constraints: {diet_str}",
            *[f"  - {directive}" for directive in dietary_directives],
            "",
            "### Accessibility & Mobility Considerations:",
            f"  - Considerations: {mobility_str}",
            *[f"  - {directive}" for directive in mobility_directives],
        ]

        if preferences.special_requests:
            user_prompt_lines.extend([
                "",
                "### Special Traveler Notes:",
                f"  - {preferences.special_requests}",
            ])

        user_prompt_lines.extend([
            "",
            "## REQUIRED OUTPUT JSON SCHEMA",
            "Return a JSON object with this exact structure:",
            "{",
            '  "days": [',
            "    {",
            '      "day_number": 1,',
            '      "date": "YYYY-MM-DD",',
            '      "title": "Inspiring theme of the day",',
            '      "notes": "Contextual notes on pacing, neighborhood tips, or weather advice",',
            '      "activities": [',
            "        {",
            '          "title": "Specific activity name / landmark",',
            '          "category": "sightseeing | food | transport | lodging | leisure | culture | nature | other",',
            '          "start_time": "HH:MM",',
            '          "end_time": "HH:MM",',
            '          "location": "District or specific address",',
            '          "estimated_cost": 25.0,',
            '          "notes": "Practical tips, transit note, or dietary/mobility detail",',
            '          "pacing_tag": "relaxed | moderate | high-energy",',
            '          "accessibility_note": "Accessibility note or step-free status",',
            '          "dietary_note": "Dietary accommodation note if food category"',
            "        }",
            "      ]",
            "    }",
            "  ]",
            "}",
        ])

        user_prompt = "\n".join(user_prompt_lines)

        personalization_summary = {
            "total_days": total_days,
            "destination": location_str,
            "travelers_count": travelers_count,
            "style": preferences.travel_style,
            "pacing": preferences.pacing,
            "budget_tier": preferences.budget_level,
            "interests": preferences.interests,
            "dietary_restrictions": preferences.dietary_restrictions,
            "mobility_concerns": preferences.mobility_concerns,
            "special_notes": preferences.special_requests,
        }

        return (
            system_prompt,
            user_prompt,
            personalization_summary,
            pacing_rules,
            dietary_directives,
            mobility_directives,
        )

    @classmethod
    def generate_preview(
        cls,
        destination: str,
        country: str | None,
        start_date: str,
        end_date: str,
        travelers_count: int,
        budget_amount: float | None,
        currency: str,
        preferences: TravelPreferencesSchema,
    ) -> PromptPreviewResponse:
        (
            system_prompt,
            user_prompt,
            summary,
            pacing_rules,
            dietary_directives,
            mobility_directives,
        ) = cls.build_prompt_package(
            destination=destination,
            country=country,
            start_date=start_date,
            end_date=end_date,
            travelers_count=travelers_count,
            budget_amount=budget_amount,
            currency=currency,
            preferences=preferences,
        )

        return PromptPreviewResponse(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            personalization_summary=summary,
            pacing_rules=pacing_rules,
            dietary_directives=dietary_directives,
            mobility_directives=mobility_directives,
        )

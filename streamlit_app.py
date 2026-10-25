"""
Daytrail — Intelligent AI Travel Itinerary Planner
Streamlit Web Application
Deployed on Streamlit Community Cloud
"""

import json
import os
import uuid
from datetime import datetime, timedelta, date
from typing import Dict, Any, List, Optional
import streamlit as st

# Configure page settings
st.set_page_config(
    page_title="Daytrail — AI Travel Itinerary Planner",
    page_icon="✈️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom High-End Styling
st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', sans-serif;
    }

    h1, h2, h3, h4, .hero-title {
        font-family: 'Outfit', sans-serif !important;
        letter-spacing: -0.02em;
    }

    /* Main Container Padding */
    .block-container {
        padding-top: 1.8rem;
        padding-bottom: 3rem;
        max-width: 1250px;
    }

    /* Hero Banner */
    .hero-card {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 50%, rgba(236, 72, 153, 0.1) 100%);
        border: 1px solid rgba(168, 85, 247, 0.3);
        border-radius: 20px;
        padding: 28px 36px;
        margin-bottom: 24px;
        box-shadow: 0 10px 30px -10px rgba(99, 102, 241, 0.25);
        backdrop-filter: blur(12px);
    }

    .hero-title {
        font-size: 2.3rem;
        font-weight: 800;
        background: linear-gradient(90deg, #FFFFFF 0%, #E2E8F0 50%, #A5B4FC 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 8px;
    }

    .hero-subtitle {
        font-size: 1.05rem;
        color: #94A3B8;
        max-width: 750px;
        line-height: 1.5;
        margin-bottom: 0px;
    }

    /* Stat & Metric Cards */
    .stat-card {
        background: rgba(30, 41, 59, 0.7);
        border: 1px solid rgba(148, 163, 184, 0.15);
        border-radius: 14px;
        padding: 16px 20px;
        text-align: center;
        transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .stat-card:hover {
        transform: translateY(-2px);
        border-color: rgba(99, 102, 241, 0.4);
    }
    .stat-val {
        font-size: 1.6rem;
        font-weight: 700;
        color: #F8FAFC;
        font-family: 'Outfit', sans-serif;
    }
    .stat-lbl {
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #94A3B8;
        margin-top: 4px;
    }

    /* Activity Card */
    .activity-card {
        background: rgba(30, 41, 59, 0.65);
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 16px;
        padding: 18px 22px;
        margin-bottom: 14px;
        position: relative;
        transition: all 0.25s ease;
    }
    .activity-card:hover {
        background: rgba(30, 41, 59, 0.9);
        border-color: rgba(129, 140, 248, 0.4);
        box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.4);
    }

    /* Badges */
    .badge-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 3px 10px;
        border-radius: 9999px;
        margin-right: 6px;
        margin-top: 4px;
    }
    .badge-category {
        background: rgba(99, 102, 241, 0.2);
        color: #A5B4FC;
        border: 1px solid rgba(99, 102, 241, 0.4);
    }
    .badge-diet {
        background: rgba(16, 185, 129, 0.15);
        color: #6EE7B7;
        border: 1px solid rgba(16, 185, 129, 0.35);
    }
    .badge-access {
        background: rgba(59, 130, 246, 0.15);
        color: #93C5FD;
        border: 1px solid rgba(59, 130, 246, 0.35);
    }
    .badge-cost {
        background: rgba(245, 158, 11, 0.15);
        color: #FCD34D;
        border: 1px solid rgba(245, 158, 11, 0.35);
    }

    /* Day Accordion Header */
    .day-header {
        background: linear-gradient(90deg, rgba(99, 102, 241, 0.18), transparent);
        border-left: 4px solid #6366F1;
        padding: 10px 16px;
        border-radius: 0 10px 10px 0;
        margin-bottom: 12px;
    }

    /* Print view container */
    @media print {
        header, footer, [data-testid="stSidebar"], .stTabs [role="tablist"] {
            display: none !important;
        }
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# Destination Hub Presets (High fidelity knowledge base)
DESTINATION_HUBS: Dict[str, Dict[str, Any]] = {
    "Kyoto, Japan": {
        "destination": "Kyoto",
        "country": "Japan",
        "currency": "JPY",
        "highlights": [
            ("Fushimi Inari Taisha (Torii Gates)", "sightseeing", "Fushimi Ward", "08:30", "10:30", 0, "Walk early to escape the crowds; flat lower paths are accessible.", "Local green tea sweets", "Step-free lower pathway"),
            ("Kiyomizu-dera Temple", "culture", "Higashiyama", "11:00", "13:00", 400, "Iconic wooden stage overlooking Kyoto. Elevator available at main hall.", "Vegetarian yofu tofu meal", "Wheelchair ramp access"),
            ("Traditional Matcha Ceremony & Garden", "leisure", "Gion", "14:00", "15:30", 2500, "Serene seated experience paired with seasonal wagashi sweets.", "Naturally vegan & nut-free sweets", "Seated tatami or chairs"),
            ("Nishiki Market Culinary Tour", "food", "Nakagyo Ward", "16:00", "18:00", 3000, "Vibrant street food arcade with 100+ vendors.", "Tofu skewers and fresh dango", "Flat arcade walking"),
            ("Pontocho Alley Evening Walk & Kaiseki", "food", "Pontocho", "19:00", "21:00", 6000, "Atmospheric lantern-lit alley along the Kamogawa River.", "Vegetarian Kaiseki available upon reservation", "Level street stroll"),
            ("Arashiyama Bamboo Grove & Tenryu-ji", "nature", "Arashiyama", "09:00", "11:30", 500, "Paved level paths winding through towering emerald bamboo stalks.", "Soy soft-serve ice cream", "Paved level path"),
            ("Golden Pavilion (Kinkaku-ji)", "culture", "Kita Ward", "13:00", "14:30", 500, "Mirror pond reflection of gold leaf pavilion; gravel paths.", "Matcha soft serve", "Step-free main path"),
            ("Philosopher's Path Canal Stroll", "nature", "Sakyo Ward", "15:30", "17:00", 0, "Peaceful canal lined with cherry trees and artisan craft shops.", "Casual cafe snacks", "Flat stone path"),
        ],
    },
    "Tokyo, Japan": {
        "destination": "Tokyo",
        "country": "Japan",
        "currency": "JPY",
        "highlights": [
            ("Senso-ji Temple & Nakamise Street", "culture", "Asakusa", "09:00", "11:00", 0, "Tokyo's oldest temple with vibrant merchant stalls.", "Vegetarian rice crackers (Senbei)", "Elevator to main hall"),
            ("teamLab Borderless Digital Art Museum", "leisure", "Azabudai Hills", "11:45", "14:00", 4200, "Mind-bending immersive digital light exhibits.", "EN TEA HOUSE vegan options", "Fully climate-controlled & step-free"),
            ("Tsukiji Outer Market Tasting", "food", "Chuo City", "14:30", "16:00", 2500, "Fresh tamagoyaki egg omelets, matcha, and fruits.", "Fresh egg tamago and sweet fruits", "Level market walkways"),
            ("Meiji Jingu Shrine & Yoyogi Park", "nature", "Shibuya", "09:30", "11:30", 0, "Tranquil forest shrine oasis in the heart of metropolitan Tokyo.", "Cafe Forest terrace dining", "Wide paved gravel paths"),
            ("Shibuya Sky & Scramble Crossing", "sightseeing", "Shibuya", "16:30", "18:30", 2200, "360-degree open-air observation deck with elevator access to top.", "Rooftop lounge beverages", "Step-free high speed elevator"),
            ("Shinjuku Omoide Yokocho Dinner", "food", "Shinjuku", "19:30", "21:30", 3500, "Historic retro food alleys with authentic skewers and local cuisine.", "Yakitori and veggie skewers", "Atmospheric compact lane"),
        ],
    },
    "Rome, Italy": {
        "destination": "Rome",
        "country": "Italy",
        "currency": "EUR",
        "highlights": [
            ("Colosseum & Roman Forum", "culture", "Piazza del Colosseo", "09:00", "12:00", 18, "Iconic amphitheater; elevator to tier levels available with booking.", "Nearby trattoria paninis", "Elevator available inside"),
            ("Monti District Trattoria Lunch", "food", "Rione Monti", "12:30", "14:00", 25, "Fresh handmade pasta, cacio e pepe, and local Roman wines.", "Vegetarian & gluten-free pasta on request", "Street level dining"),
            ("Pantheon & Piazza Navona", "sightseeing", "Centro Storico", "15:00", "17:00", 5, "Remarkable ancient dome and Bernini's Fontana dei Quattro Fiumi.", "Gelato at Giolitti", "Step-free piazza & entrance"),
            ("Trevi Fountain & Artisan Gelato", "leisure", "Trevi", "17:30", "19:00", 8, "Toss a coin into the fountain and savor pistachio gelato nearby.", "Nut-free & vegan fruit sorbets", "Flat paved cobblestone"),
            ("Vatican Museums & Sistine Chapel", "culture", "Vatican City", "09:00", "12:30", 22, "Michelangelo's masterpieces with dedicated wheelchair elevator routes.", "Vatican Courtyard cafeteria", "Dedicated accessible route"),
            ("Trastevere Sunset Walk & Dinner", "food", "Trastevere", "18:30", "21:30", 35, "Cobblestone charm, guitar players in piazzas, and rustic wood-fired pizza.", "Margherita pizza & artichoke alla giudia", "Atmospheric pedestrian zone"),
        ],
    },
    "Paris, France": {
        "destination": "Paris",
        "country": "France",
        "currency": "EUR",
        "highlights": [
            ("Louvre Museum Highlights Tour", "culture", "1st Arrondissement", "09:30", "12:30", 22, "Winged Victory and Mona Lisa; accessible pyramid entrance with glass elevator.", "Cafe Richelieu light lunch", "Glass elevator at pyramid"),
            ("Tuileries Garden & Angelina Cafe", "leisure", "Tuileries", "13:00", "14:30", 20, "Relaxed stroll along tree-lined basins and legendary hot chocolate.", "Hot chocolate & vegan macarons", "Flat sandy park paths"),
            ("Musee d'Orsay Impressionists", "culture", "7th Arrondissement", "15:00", "17:30", 16, "Former train station housing masterpieces by Monet, Van Gogh, and Degas.", "Restaurant d'Orsay", "Full elevator coverage"),
            ("Seine River Twilight Cruise", "sightseeing", "Pont Neuf", "18:30", "20:00", 18, "Gliding past illuminated monuments with step-free boarding.", "On-board refreshments", "Step-free ramp boarding"),
            ("Montmartre & Sacre-Coeur", "culture", "18th Arrondissement", "10:00", "12:30", 0, "Funicular railway available to bypass the stairs to the basilica terrace.", "Boulangerie croissants", "Funicular lift bypasses stairs"),
            ("Le Marais Bakery & Boutique Walk", "food", "4th Arrondissement", "14:00", "16:30", 15, "Historic mansion streets, falafel at L'As du Fallafel, and pastry salons.", "Famous vegetarian falafel pita", "Level sidewalk stroll"),
        ],
    },
    "Barcelona, Spain": {
        "destination": "Barcelona",
        "country": "Spain",
        "currency": "EUR",
        "highlights": [
            ("Sagrada Familia Basilica Tour", "culture", "Eixample", "09:00", "11:30", 26, "Gaudi's masterpiece with rainbow stained glass; ramps and elevator access.", "Local churros con chocolate", "Wheelchair accessible with ramps"),
            ("Park Guell Architectural Terrace", "nature", "Gracia", "12:30", "14:30", 13, "Mosaic salamander and panoramic Mediterranean coastline views.", "Fresh fruit cups & smoothies", "Paved paths & shuttle service"),
            ("Gothic Quarter & Born Tapas Crawl", "food", "El Born", "15:30", "17:30", 28, "Patatas bravas, padron peppers, and crisp cava in medieval plazas.", "Vegetarian tapas: pan con tomate, padron", "Pedestrian historical alleys"),
            ("Barceloneta Beachfront Sunset Promenade", "leisure", "Barceloneta", "18:30", "20:30", 0, "Flat seaside boardwalk lined with palm trees and ocean breeze.", "Seafood paella & sangria", "Completely flat boardwalk"),
        ],
    },
    "New York City, USA": {
        "destination": "New York City",
        "country": "USA",
        "currency": "USD",
        "highlights": [
            ("Central Park & Bethesda Terrace", "nature", "Manhattan", "09:30", "11:30", 0, "Iconic shaded elm walkways, rowboats, and tranquil fountain plazas.", "Bagels with cream cheese", "Paved asphalt paths"),
            ("Metropolitan Museum of Art (The Met)", "culture", "Upper East Side", "12:00", "15:00", 30, "World-class galleries spanning Egyptian temples to modern art; fully accessible.", "The Met cafe dining", "Elevator and ramp access"),
            ("High Line Elevated Park Stroll", "sightseeing", "Chelsea", "15:30", "17:00", 0, "Elevated linear park built on former rail line with elevator access points.", "Artisan coffee kiosks", "Step-free elevator access"),
            ("Chelsea Market Artisan Food Tasting", "food", "Meatpacking", "17:30", "19:00", 25, "Indoor food hall featuring tacos, noodles, and bakeries.", "Vegan tacos & gluten-free baked treats", "Ground level indoor hall"),
            ("Broadway Musical Experience", "leisure", "Theater District", "19:30", "22:00", 95, "World-renowned performing arts in iconic historic Broadway theaters.", "Pre-theater dining menu", "Accessible orchestra seating"),
        ],
    },
}

# Category Icons & Colors
CATEGORY_META = {
    "sightseeing": {"icon": "🏛️", "label": "Sightseeing", "color": "#6366F1"},
    "culture": {"icon": "🎨", "label": "Culture & Art", "color": "#EC4899"},
    "food": {"icon": "🍜", "label": "Food & Dining", "color": "#F59E0B"},
    "nature": {"icon": "🌲", "label": "Nature & Outdoors", "color": "#10B981"},
    "leisure": {"icon": "☕", "label": "Leisure & Wellness", "color": "#8B5CF6"},
    "transport": {"icon": "🚆", "label": "Transit & Transfer", "color": "#06B6D4"},
}

def get_gemini_api_key() -> str:
    # Check secrets or environment
    if "GEMINI_API_KEY" in st.secrets:
        return st.secrets["GEMINI_API_KEY"]
    if os.environ.get("GEMINI_API_KEY"):
        return os.environ.get("GEMINI_API_KEY")
    return st.session_state.get("custom_gemini_key", "")

# Initialize Session State
if "itinerary" not in st.session_state:
    st.session_state.itinerary = None
if "trip_metadata" not in st.session_state:
    st.session_state.trip_metadata = None
if "saved_trips" not in st.session_state:
    st.session_state.saved_trips = []

# Fallback Generator Function
def generate_fallback_itinerary(
    destination: str,
    country: str,
    start_date: str,
    total_days: int,
    travelers_count: int,
    budget_amount: float,
    currency: str,
    pacing: str,
    travel_style: str,
    dietary_list: List[str],
    mobility_list: List[str],
    interests_list: List[str],
) -> List[Dict[str, Any]]:
    # Find matching hub preset or dynamic generator
    matched_hub = None
    for k, hub in DESTINATION_HUBS.items():
        if destination.lower() in k.lower() or k.lower() in destination.lower():
            matched_hub = hub
            break

    if pacing == "relaxed":
        acts_per_day = 3
        start_hour = 10
        gap_min = 180
    elif pacing == "fast":
        acts_per_day = 5
        start_hour = 8
        gap_min = 130
    else:
        acts_per_day = 4
        start_hour = 9
        gap_min = 150

    days_result = []
    base_date = datetime.strptime(start_date, "%Y-%m-%d")

    for d_idx in range(total_days):
        day_date = (base_date + timedelta(days=d_idx)).strftime("%Y-%m-%d")
        day_num = d_idx + 1
        is_first = (d_idx == 0)
        is_last = (d_idx == total_days - 1 and total_days > 1)

        if is_first:
            day_title = f"Arrival & Discovery in {destination}"
            day_notes = f"Check-in, adjust to local rhythm, and enjoy gentle introductory exploration. Paced at {pacing} tempo."
        elif is_last:
            day_title = f"Memorable Highlights & Farewell {destination}"
            day_notes = "Last-minute souvenir shopping, iconic viewpoint, and celebratory farewell meal."
        else:
            interest = interests_list[d_idx % len(interests_list)] if interests_list else "Local Culture"
            day_title = f"{interest.title()} & Hidden Gems of {destination}"
            day_notes = f"Immersive day emphasizing {interest.lower()} and atmospheric neighborhood exploration."

        activities = []
        curr_time = datetime.strptime(f"{start_hour:02d}:30", "%H:%M")
        slots = max(2, acts_per_day - (1 if (is_first or is_last) else 0))

        for s_idx in range(slots):
            end_time = curr_time + timedelta(minutes=gap_min - 30)
            t_start = curr_time.strftime("%H:%M")
            t_end = end_time.strftime("%H:%M")

            if matched_hub:
                h_list = matched_hub["highlights"]
                item = h_list[(d_idx * slots + s_idx) % len(h_list)]
                title, cat, loc, _, _, cost, note, diet_n, acc_n = item
                cost_val = float(cost)
            else:
                cat_choices = ["sightseeing", "food", "culture", "leisure", "nature"]
                cat = cat_choices[s_idx % len(cat_choices)]
                loc = f"Central {destination}"
                cost_val = 15.0 if cat != "food" else 28.0
                if s_idx == 0 and is_first:
                    title = f"Arrival & Check-in at {destination} Boutique Stay"
                    cat = "transport"
                    note = "Unpack, refresh, and pick up local travel cards."
                elif s_idx == 0:
                    title = f"Morning Coffee & Scenic Stroll through {destination} Center"
                    note = f"Start your morning with local coffee and fresh pastries in {destination}."
                elif s_idx == 1:
                    title = f"Signature Landmark & Museum of {destination}"
                    note = f"Explore world-renowned architecture and collections in {destination}."
                elif s_idx == 2:
                    title = f"Artisan Lunch & Food Market Crawl"
                    cat = "food"
                    note = f"Taste specialty recipes made with seasonal produce from {destination}."
                elif s_idx == 3:
                    title = f"Panoramic Sunset Lookout & Stroll"
                    cat = "nature"
                    note = "Watch the golden afternoon light across historical landmarks."
                else:
                    title = f"Evening Gastronomy & Local Night Walk"
                    cat = "food"
                    note = "Unwind with dinner and a relaxed stroll through illuminated lanes."

                diet_n = f"Dietary verified for {', '.join(dietary_list)}" if dietary_list else "Authentic regional menu"
                acc_n = f"Mobility adapted ({mobility_list[0]})" if mobility_list else "Paved pedestrian pathways"

            activities.append({
                "id": str(uuid.uuid4()),
                "title": title,
                "category": cat,
                "start_time": t_start,
                "end_time": t_end,
                "location": loc,
                "estimated_cost": cost_val,
                "currency": currency,
                "notes": note,
                "dietary_note": diet_n if dietary_list else None,
                "accessibility_note": acc_n if mobility_list else None,
            })
            curr_time = end_time + timedelta(minutes=30)

        days_result.append({
            "day_number": day_num,
            "date": day_date,
            "title": day_title,
            "notes": day_notes,
            "activities": activities,
        })

    return days_result

# AI Gemini Generator Function
def generate_gemini_itinerary(
    api_key: str,
    destination: str,
    country: str,
    start_date: str,
    total_days: int,
    travelers_count: int,
    budget_amount: float,
    currency: str,
    pacing: str,
    travel_style: str,
    dietary_list: List[str],
    mobility_list: List[str],
    interests_list: List[str],
) -> Optional[List[Dict[str, Any]]]:
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={"response_mime_type": "application/json"},
        )
        prompt = f"""
        You are an expert master travel planner creating an elite, hyper-personalized {total_days}-day itinerary for {destination}, {country}.
        
        Trip Specifications:
        - Start Date: {start_date}
        - Total Days: {total_days}
        - Travelers: {travelers_count}
        - Pacing: {pacing} ({'2-3 unhurried activities, late start' if pacing=='relaxed' else '5-6 fast-paced dynamic spots' if pacing=='fast' else '3-4 balanced activities'})
        - Travel Style: {travel_style}
        - Budget: {budget_amount} {currency} total
        - Interests: {', '.join(interests_list)}
        - Dietary Requirements: {', '.join(dietary_list) if dietary_list else 'None'}
        - Mobility Requirements: {', '.join(mobility_list) if mobility_list else 'Standard'}

        Return a valid JSON object strictly matching this schema:
        {{
            "days": [
                {{
                    "day_number": 1,
                    "date": "{start_date}",
                    "title": "Day title",
                    "notes": "Day overview and pacing advice",
                    "activities": [
                        {{
                            "title": "Activity Name",
                            "category": "sightseeing|food|culture|nature|leisure|transport",
                            "start_time": "09:30",
                            "end_time": "11:30",
                            "location": "Address / neighborhood",
                            "estimated_cost": 25.0,
                            "notes": "Practical tips & context",
                            "dietary_note": "How this accommodates dietary restrictions",
                            "accessibility_note": "Wheelchair/step-free verification"
                        }}
                    ]
                }}
            ]
        }}
        """
        response = model.generate_content(prompt)
        parsed = json.loads(response.text)
        days = parsed.get("days", [])
        if days:
            # Add unique IDs
            for d in days:
                for a in d.get("activities", []):
                    a["id"] = str(uuid.uuid4())
                    a["currency"] = currency
            return days
        return None
    except Exception as e:
        st.warning(f"Gemini API note: {e}. Utilizing internal semantic generation engine.")
        return None

# ============================
# SIDEBAR
# ============================
with st.sidebar:
    st.markdown("### ✈️ Daytrail Settings")
    st.markdown("Personalize your AI planner credentials & global currency.")
    
    api_key_input = st.text_input(
        "Google Gemini API Key",
        value=get_gemini_api_key(),
        type="password",
        help="Optional: Enter your Gemini API key for live AI generation. If left empty, Daytrail uses its built-in high-fidelity generator.",
    )
    if api_key_input:
        st.session_state["custom_gemini_key"] = api_key_input

    st.markdown("---")
    st.markdown("### ⚡ Quick Hub Presets")
    st.caption("Click any popular destination to auto-populate the form:")
    
    preset_choice = st.selectbox(
        "Select Destination Preset",
        ["Custom Destination"] + list(DESTINATION_HUBS.keys()),
        index=0,
    )

    st.markdown("---")
    st.markdown("### 💡 About Daytrail")
    st.info(
        "**Daytrail** plans trips by accounting for pacing energy, dietary restrictions, mobility needs, and budget utilization."
    )
    st.caption("Deployed on Streamlit Community Cloud • Free & Open Source")

# ============================
# TOP HERO BANNER
# ============================
st.markdown(
    """
    <div class="hero-card">
        <div class="hero-title">Daytrail — Intelligent AI Travel Planner</div>
        <div class="hero-subtitle">
            Draft bespoke, realistic day-by-day itineraries tailored to your travel style, energy pacing, 
            dietary requirements, mobility needs, and real budget limits.
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# Navigation Tabs
tab_plan, tab_itinerary, tab_analytics, tab_saved, tab_export = st.tabs(
    ["🎯 Plan Trip", "🗺️ Interactive Itinerary", "📊 Budget & Pacing", "💾 Saved Trips", "📄 Export & Print"]
)

# ============================
# TAB 1: PLAN NEW TRIP
# ============================
with tab_plan:
    st.markdown("### 🛠️ Configure Your Journey")
    
    # Preload from preset if selected
    def_dest = "Kyoto"
    def_country = "Japan"
    def_currency = "USD"
    if preset_choice != "Custom Destination":
        p_data = DESTINATION_HUBS[preset_choice]
        def_dest = p_data["destination"]
        def_country = p_data["country"]
        def_currency = p_data["currency"]

    col1, col2 = st.columns([1, 1], gap="large")

    with col1:
        st.markdown("#### 1. Destination & Travelers")
        dest_input = st.text_input("Destination City", value=def_dest, placeholder="e.g. Kyoto, Paris, Rome, Tokyo")
        country_input = st.text_input("Country", value=def_country, placeholder="e.g. Japan, France, Italy")

        date_col1, date_col2 = st.columns(2)
        with date_col1:
            start_date_input = st.date_input("Start Date", value=date.today() + timedelta(days=14))
        with date_col2:
            end_date_input = st.date_input("End Date", value=date.today() + timedelta(days=18))

        calc_days = max(1, (end_date_input - start_date_input).days + 1)
        st.caption(f"🗓️ Trip Length: **{calc_days} Days**")

        travelers_count = st.number_input("Number of Travelers", min_value=1, max_value=20, value=2)

    with col2:
        st.markdown("#### 2. Pacing, Budget & Style")
        
        pacing_choice = st.select_slider(
            "Pacing Level",
            options=["relaxed", "moderate", "fast"],
            value="moderate",
            help="Relaxed (2-3 stops, buffer breaks) • Moderate (3-4 stops) • Fast (5-6 stops early kickoff)",
        )

        style_choice = st.selectbox(
            "Travel Style",
            [
                "Cultural Explorer",
                "Romantic Getaway",
                "Solo Backpacker",
                "Family Friendly",
                "Foodie & Culinary Adventure",
                "Luxury & Wellness",
                "Nature & Outdoor Thrills",
            ],
            index=0,
        )

        b_col1, b_col2 = st.columns([2, 1])
        with b_col1:
            budget_amount = st.number_input("Total Target Budget", min_value=100.0, max_value=100000.0, value=1500.0, step=100.0)
        with b_col2:
            currency_choice = st.selectbox("Currency", ["USD", "EUR", "JPY", "GBP", "CAD", "AUD", "INR"], index=0)

    st.markdown("---")
    col3, col4 = st.columns([1, 1], gap="large")

    with col3:
        st.markdown("#### 3. Dietary Accommodations")
        dietary_options = st.multiselect(
            "Select Dietary Requirements",
            [
                "Vegetarian",
                "Vegan",
                "Halal",
                "Kosher",
                "Gluten-Free",
                "Dairy-Free",
                "Nut Allergies",
                "Seafood-Free",
            ],
            default=["Vegetarian"] if preset_choice != "Custom Destination" else [],
            help="Venues and meals will be vetted for verified menu safety.",
        )

    with col4:
        st.markdown("#### 4. Accessibility & Mobility Directives")
        mobility_options = st.multiselect(
            "Select Mobility Requirements",
            [
                "Wheelchair Accessible",
                "Step-Free Access",
                "Minimal Walking / Low Endurance",
                "Senior Friendly",
                "Elevator Required for Viewpoints",
            ],
            default=["Step-Free Access"] if preset_choice != "Custom Destination" else [],
            help="Routes will eliminate steep stairways and cluster contiguous walking stops.",
        )

    st.markdown("#### 5. Specific Interests & Must-See Attractions")
    interests_options = st.multiselect(
        "Interests",
        [
            "Historic Shrines & Temples",
            "Art Museums & Galleries",
            "Street Food & Local Markets",
            "Botanical Gardens & Parks",
            "Scenic Panoramic Views",
            "Boutique Shopping & Crafts",
            "Architecture & Landmarks",
            "Nightlife & Evening Lounges",
        ],
        default=["Historic Shrines & Temples", "Street Food & Local Markets"],
    )

    special_notes = st.text_area(
        "Custom Notes / Must-Include Spots",
        placeholder="e.g. Please reserve evening time for shopping in Gion or enjoying a river cruise.",
    )

    st.markdown("---")
    
    # Generate Itinerary Button
    gen_col1, gen_col2 = st.columns([2, 1])
    with gen_col1:
        submit_btn = st.button("🚀 Generate Bespoke Itinerary with AI", type="primary", use_container_width=True)

    if submit_btn:
        with st.spinner(f"Architecting your {calc_days}-day adventure for {dest_input}..."):
            api_key = get_gemini_api_key()
            days_data = None
            used_ai = False

            if api_key and api_key != "your_gemini_api_key_here":
                days_data = generate_gemini_itinerary(
                    api_key=api_key,
                    destination=dest_input,
                    country=country_input,
                    start_date=start_date_input.strftime("%Y-%m-%d"),
                    total_days=calc_days,
                    travelers_count=travelers_count,
                    budget_amount=budget_amount,
                    currency=currency_choice,
                    pacing=pacing_choice,
                    travel_style=style_choice,
                    dietary_list=dietary_options,
                    mobility_list=mobility_options,
                    interests_list=interests_options,
                )
                if days_data:
                    used_ai = True

            if not days_data:
                days_data = generate_fallback_itinerary(
                    destination=dest_input,
                    country=country_input,
                    start_date=start_date_input.strftime("%Y-%m-%d"),
                    total_days=calc_days,
                    travelers_count=travelers_count,
                    budget_amount=budget_amount,
                    currency=currency_choice,
                    pacing=pacing_choice,
                    travel_style=style_choice,
                    dietary_list=dietary_options,
                    mobility_list=mobility_options,
                    interests_list=interests_options,
                )

            # Store in session state
            trip_meta = {
                "id": str(uuid.uuid4()),
                "destination": dest_input,
                "country": country_input,
                "start_date": start_date_input.strftime("%Y-%m-%d"),
                "end_date": end_date_input.strftime("%Y-%m-%d"),
                "total_days": calc_days,
                "travelers_count": travelers_count,
                "budget_amount": budget_amount,
                "currency": currency_choice,
                "pacing": pacing_choice,
                "travel_style": style_choice,
                "dietary": dietary_options,
                "mobility": mobility_options,
                "interests": interests_options,
                "used_gemini": used_ai,
                "created_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            }

            st.session_state.itinerary = days_data
            st.session_state.trip_metadata = trip_meta

            # Add to saved trips
            st.session_state.saved_trips.append({
                "meta": trip_meta,
                "days": days_data,
            })

            engine_text = "Google Gemini AI (Cloud)" if used_ai else "Daytrail Semantic Engine (Instant)"
            st.success(f"✨ Itinerary for {dest_input} crafted successfully via {engine_text}!")
            st.balloons()

# ============================
# TAB 2: INTERACTIVE ITINERARY
# ============================
with tab_itinerary:
    if not st.session_state.itinerary or not st.session_state.trip_metadata:
        st.info("👋 No active itinerary yet. Go to the **'Plan Trip'** tab and generate your personalized journey!")
    else:
        meta = st.session_state.trip_metadata
        itinerary = st.session_state.itinerary

        # Top summary bar
        t_col1, t_col2, t_col3, t_col4 = st.columns(4)
        with t_col1:
            st.markdown(
                f"""<div class="stat-card">
                    <div class="stat-val">{meta['destination']}</div>
                    <div class="stat-lbl">{meta['country'] or 'Global'}</div>
                </div>""",
                unsafe_allow_html=True,
            )
        with t_col2:
            st.markdown(
                f"""<div class="stat-card">
                    <div class="stat-val">{meta['total_days']} Days</div>
                    <div class="stat-lbl">{meta['start_date']} to {meta['end_date']}</div>
                </div>""",
                unsafe_allow_html=True,
            )
        with t_col3:
            total_activity_cost = sum(
                float(a.get("estimated_cost", 0))
                for d in itinerary
                for a in d.get("activities", [])
            )
            st.markdown(
                f"""<div class="stat-card">
                    <div class="stat-val">{meta['currency']} {total_activity_cost:,.0f}</div>
                    <div class="stat-lbl">Planned Activity Spend</div>
                </div>""",
                unsafe_allow_html=True,
            )
        with t_col4:
            st.markdown(
                f"""<div class="stat-card">
                    <div class="stat-val">{meta['pacing'].title()}</div>
                    <div class="stat-lbl">Tempo Directives</div>
                </div>""",
                unsafe_allow_html=True,
            )

        st.markdown("<br>", unsafe_allow_html=True)

        # Day selection pills / tabs
        day_labels = [f"Day {d['day_number']} ({d['date'][5:]})" for d in itinerary]
        selected_day_idx = st.selectbox(
            "Select Itinerary Day to View / Edit:",
            range(len(itinerary)),
            format_func=lambda i: f"🗓️ Day {itinerary[i]['day_number']} — {itinerary[i]['title']} ({itinerary[i]['date']})",
        )

        curr_day = itinerary[selected_day_idx]

        st.markdown(
            f"""
            <div class="day-header">
                <h3 style="margin: 0; color: #F8FAFC;">Day {curr_day['day_number']}: {curr_day['title']}</h3>
                <p style="margin: 4px 0 0 0; color: #94A3B8; font-size: 0.95rem;">{curr_day['notes']}</p>
            </div>
            """,
            unsafe_allow_html=True,
        )

        # Activities for selected day
        for a_idx, act in enumerate(curr_day.get("activities", [])):
            cat_info = CATEGORY_META.get(act.get("category", "sightseeing"), CATEGORY_META["sightseeing"])
            
            diet_badge = (
                f'<span class="badge-pill badge-diet">🌱 {act["dietary_note"]}</span>'
                if act.get("dietary_note")
                else ""
            )
            access_badge = (
                f'<span class="badge-pill badge-access">♿ {act["accessibility_note"]}</span>'
                if act.get("accessibility_note")
                else ""
            )

            st.markdown(
                f"""
                <div class="activity-card">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap;">
                        <h4 style="margin: 0; font-size: 1.15rem; color: #FFFFFF;">
                            {cat_info['icon']} {act['title']}
                        </h4>
                        <div style="font-weight: 600; color: #E2E8F0;">
                            ⏰ {act['start_time']} – {act['end_time']}
                        </div>
                    </div>
                    <div style="color: #94A3B8; font-size: 0.88rem; margin: 4px 0 8px 0;">
                        📍 {act['location']}
                    </div>
                    <p style="margin: 6px 0 10px 0; color: #CBD5E1; font-size: 0.93rem; line-height: 1.45;">
                        {act['notes']}
                    </p>
                    <div style="display: flex; flex-wrap: wrap; align-items: center;">
                        <span class="badge-pill badge-category">{cat_info['label']}</span>
                        <span class="badge-pill badge-cost">{act.get('currency', meta['currency'])} {float(act.get('estimated_cost', 0)):,.0f}</span>
                        {diet_badge}
                        {access_badge}
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

        # Quick Add Activity to Current Day
        with st.expander("➕ Add Custom Stop to this Day"):
            with st.form(f"add_act_form_{curr_day['day_number']}"):
                col_a1, col_a2 = st.columns([2, 1])
                with col_a1:
                    new_title = st.text_input("Activity Title", placeholder="e.g. Evening Jazz Bar in Gion")
                    new_loc = st.text_input("Location", placeholder="e.g. Kawaramachi, Kyoto")
                with col_a2:
                    new_cat = st.selectbox("Category", list(CATEGORY_META.keys()))
                    new_cost = st.number_input("Estimated Cost", min_value=0.0, value=20.0, step=5.0)

                t1, t2 = st.columns(2)
                with t1:
                    new_start = st.text_input("Start Time", value="16:00")
                with t2:
                    new_end = st.text_input("End Time", value="17:30")

                new_notes = st.text_area("Notes & Tips", placeholder="Special reservations or directions...")

                add_submit = st.form_submit_button("Add Activity")
                if add_submit and new_title:
                    curr_day["activities"].append({
                        "id": str(uuid.uuid4()),
                        "title": new_title,
                        "category": new_cat,
                        "start_time": new_start,
                        "end_time": new_end,
                        "location": new_loc,
                        "estimated_cost": new_cost,
                        "currency": meta["currency"],
                        "notes": new_notes,
                        "dietary_note": None,
                        "accessibility_note": None,
                    })
                    st.success(f"Added '{new_title}' to Day {curr_day['day_number']}!")
                    st.rerun()

# ============================
# TAB 3: BUDGET & PACING
# ============================
with tab_analytics:
    if not st.session_state.itinerary or not st.session_state.trip_metadata:
        st.info("Plan an itinerary first to inspect budget allocation and pacing analysis.")
    else:
        meta = st.session_state.trip_metadata
        itinerary = st.session_state.itinerary

        st.markdown("### 📊 Budget Allocation & Financial Health")

        total_budget = float(meta["budget_amount"])
        planned_acts_cost = sum(
            float(a.get("estimated_cost", 0))
            for d in itinerary
            for a in d.get("activities", [])
        )
        buffer_reserve = max(0.0, total_budget - planned_acts_cost)
        utilization_pct = min(100.0, (planned_acts_cost / total_budget) * 100.0) if total_budget > 0 else 0

        b_c1, b_c2, b_c3 = st.columns(3)
        with b_c1:
            st.metric("Total Travel Budget", f"{meta['currency']} {total_budget:,.0f}")
        with b_c2:
            st.metric("Activities & Dining", f"{meta['currency']} {planned_acts_cost:,.0f}", f"{utilization_pct:.1f}% of total")
        with b_c3:
            st.metric("Lodging & Emergency Buffer", f"{meta['currency']} {buffer_reserve:,.0f}")

        st.progress(utilization_pct / 100.0)

        st.markdown("---")
        st.markdown("### 🥧 Spend by Category")

        cat_costs = {}
        for d in itinerary:
            for a in d.get("activities", []):
                c = a.get("category", "sightseeing")
                cat_costs[c] = cat_costs.get(c, 0.0) + float(a.get("estimated_cost", 0))

        cat_cols = st.columns(len(cat_costs) if cat_costs else 1)
        for idx, (cat_name, cost_amt) in enumerate(cat_costs.items()):
            c_info = CATEGORY_META.get(cat_name, CATEGORY_META["sightseeing"])
            with cat_cols[idx % len(cat_cols)]:
                st.markdown(
                    f"""
                    <div class="stat-card">
                        <div style="font-size: 1.8rem;">{c_info['icon']}</div>
                        <div class="stat-val" style="font-size: 1.25rem;">{meta['currency']} {cost_amt:,.0f}</div>
                        <div class="stat-lbl">{c_info['label']}</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

# ============================
# TAB 4: SAVED TRIPS
# ============================
with tab_saved:
    st.markdown("### 💾 Saved Itineraries")
    if not st.session_state.saved_trips:
        st.info("No saved itineraries yet. When you generate a trip, it automatically saves here.")
    else:
        for idx, item in enumerate(st.session_state.saved_trips):
            m = item["meta"]
            with st.container():
                st.markdown(
                    f"""
                    <div class="activity-card">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h3 style="margin: 0; color: #A5B4FC;">🌍 {m['destination']}, {m['country']}</h3>
                                <p style="margin: 4px 0 0 0; color: #94A3B8;">
                                    {m['total_days']} Days ({m['start_date']} to {m['end_date']}) • {m['pacing'].title()} Pacing • {m['currency']} {m['budget_amount']} Budget
                                </p>
                            </div>
                            <div style="font-size: 0.85rem; color: #64748B;">
                                Created: {m['created_at']}
                            </div>
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )
                b_c1, b_c2 = st.columns([1, 4])
                with b_c1:
                    if st.button(f"Load Itinerary #{idx+1}", key=f"load_{idx}"):
                        st.session_state.itinerary = item["days"]
                        st.session_state.trip_metadata = m
                        st.success(f"Loaded trip for {m['destination']} into active workspace!")
                        st.rerun()

# ============================
# TAB 5: EXPORT & PRINT
# ============================
with tab_export:
    if not st.session_state.itinerary or not st.session_state.trip_metadata:
        st.info("Generate or load an itinerary to export or print.")
    else:
        meta = st.session_state.trip_metadata
        itinerary = st.session_state.itinerary

        st.markdown("### 📄 Export & Printable Document")
        st.write("Download your full itinerary in structured JSON format or prepare a clean print-ready layout.")

        # JSON Download
        json_data = json.dumps({"metadata": meta, "days": itinerary}, indent=2)
        st.download_button(
            label="📥 Download Itinerary JSON",
            data=json_data,
            file_name=f"itinerary_{meta['destination'].lower()}_{meta['start_date']}.json",
            mime="application/json",
            use_container_width=False,
        )

        st.markdown("---")
        st.markdown("#### 🖨️ Printable Document Preview")

        print_html = f"""
        <div style="background: #FFFFFF; color: #0F172A; padding: 30px; border-radius: 12px; font-family: sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="border-bottom: 2px solid #6366F1; padding-bottom: 15px; margin-bottom: 20px;">
                <h1 style="margin: 0; color: #1E293B;">Travel Itinerary: {meta['destination']}, {meta['country']}</h1>
                <p style="margin: 5px 0 0 0; color: #64748B;">
                    Dates: {meta['start_date']} to {meta['end_date']} ({meta['total_days']} Days) | Travelers: {meta['travelers_count']} | Pacing: {meta['pacing'].title()} | Total Budget: {meta['currency']} {meta['budget_amount']}
                </p>
            </div>
        """

        for d in itinerary:
            print_html += f"""
            <div style="margin-bottom: 24px;">
                <h3 style="background: #F1F5F9; padding: 8px 12px; border-left: 4px solid #6366F1; margin: 0 0 8px 0; color: #0F172A;">
                    Day {d['day_number']}: {d['title']} ({d['date']})
                </h3>
                <p style="font-size: 0.9rem; color: #475569; margin: 0 0 10px 4px;">{d['notes']}</p>
                <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                    <thead>
                        <tr style="border-bottom: 1px solid #CBD5E1; text-align: left; color: #64748B;">
                            <th style="padding: 6px 8px;">Time</th>
                            <th style="padding: 6px 8px;">Activity</th>
                            <th style="padding: 6px 8px;">Location</th>
                            <th style="padding: 6px 8px;">Cost</th>
                            <th style="padding: 6px 8px;">Notes & Directives</th>
                        </tr>
                    </thead>
                    <tbody>
            """
            for a in d.get("activities", []):
                notes_text = a.get("notes", "")
                if a.get("dietary_note"):
                    notes_text += f" [Dietary: {a['dietary_note']}]"
                if a.get("accessibility_note"):
                    notes_text += f" [Access: {a['accessibility_note']}]"

                print_html += f"""
                    <tr style="border-bottom: 1px solid #F1F5F9;">
                        <td style="padding: 8px; font-weight: bold; white-space: nowrap;">{a['start_time']} - {a['end_time']}</td>
                        <td style="padding: 8px; font-weight: 600;">{a['title']}</td>
                        <td style="padding: 8px; color: #64748B;">{a['location']}</td>
                        <td style="padding: 8px; white-space: nowrap;">{a.get('currency', meta['currency'])} {float(a.get('estimated_cost', 0)):,.0f}</td>
                        <td style="padding: 8px; color: #334155;">{notes_text}</td>
                    </tr>
                """
            print_html += """
                    </tbody>
                </table>
            </div>
            """

        print_html += """
        </div>
        """

        st.components.v1.html(print_html, height=600, scrolling=True)

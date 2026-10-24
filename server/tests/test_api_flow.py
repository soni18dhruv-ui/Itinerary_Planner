import urllib.request
import json

def test_api():
    preview_req = {
        "destination": "Kyoto",
        "country": "Japan",
        "start_date": "2026-11-10",
        "end_date": "2026-11-14",
        "travelers_count": 2,
        "budget_amount": 3000,
        "currency": "USD",
        "preferences": {
            "travel_style": "culture",
            "pacing": "relaxed",
            "budget_level": "moderate",
            "interests": ["history", "tea ceremonies", "gardens"],
            "dietary_restrictions": ["Vegetarian", "Gluten-Free"],
            "mobility_concerns": ["Wheelchair Accessible", "Minimal Walking"],
            "special_requests": "Scenic viewpoints and quiet spots"
        }
    }

    # 1. Preview Prompt
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/itinerary/preview-prompt",
        data=json.dumps(preview_req).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        preview_data = json.loads(resp.read().decode())
    print("[PASS] Preview Prompt:")
    print("  - Pacing rules:", len(preview_data["pacing_rules"]))
    print("  - Dietary directives:", len(preview_data["dietary_directives"]))
    print("  - Mobility directives:", len(preview_data["mobility_directives"]))

    # 2. Create Trip & Generate Itinerary
    trip_req = {
        "title": "Kyoto Relaxed Zen Experience",
        "destination": "Kyoto",
        "country": "Japan",
        "start_date": "2026-11-10",
        "end_date": "2026-11-14",
        "travelers_count": 2,
        "budget_amount": 3000,
        "currency": "USD",
        "preferences": preview_req["preferences"],
        "generate": True,
        "user_id": "alex-vance"
    }
    req2 = urllib.request.Request(
        "http://127.0.0.1:8000/api/trips",
        data=json.dumps(trip_req).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req2) as resp2:
        trip_data = json.loads(resp2.read().decode())
    print("\n[PASS] Trip Created with AI Itinerary:")
    print("  - Trip ID:", trip_data["id"])
    print("  - Days count:", len(trip_data["itinerary_days"]))
    for d in trip_data["itinerary_days"]:
        print(f"    * Day {d['day_number']}: {d['title']} ({len(d['activities'])} activities)")
        for a in d["activities"][:2]:
            print(f"        - [{a['start_time']} - {a['end_time']}] {a['title']} | Pacing: {a['pacing_tag']} | Dietary: {a['dietary_note']} | Access: {a['accessibility_note']}")

    # 3. History
    with urllib.request.urlopen("http://127.0.0.1:8000/api/history") as resp3:
        history_data = json.loads(resp3.read().decode())
    print(f"\n[PASS] History logged: {len(history_data)} items")

if __name__ == "__main__":
    test_api()

from app.db import homes_collection

def get_all_addresses():
    homes = homes_collection.find().limit(100)

    results = []
    for home in homes:
        results.append({
            "id": str(home.get("_id")),
            "address": home.get("parcel_address"),
            "city": home.get("parcel_city"),
            "state": home.get("parcel_state"),
            "zip": home.get("parcel_zip"),
            "latitude": home.get("input_latitude"),
            "longitude": home.get("input_longitude")
        })

    return results
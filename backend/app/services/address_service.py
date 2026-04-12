from bson import ObjectId

from app.db import homes_collection


def _serialize_home(home):
    if not home:
        return None

    return {
        "id": str(home.get("_id")),
        "address": home.get("parcel_address"),
        "city": home.get("parcel_city"),
        "state": home.get("parcel_state"),
        "zip": home.get("parcel_zip"),
        "latitude": home.get("input_latitude"),
        "longitude": home.get("input_longitude"),
        "county": home.get("county"),
        "usecode": home.get("usecode"),
        "usedesc": home.get("usedesc"),
        "zoning": home.get("zoning"),
        "zoning_description": home.get("zoning_description"),
        "zoning_type": home.get("zoning_type"),
        "zoning_subtype": home.get("zoning_subtype"),
        "structstyle": home.get("structstyle"),
        "numunits": home.get("numunits"),
        "numstories": home.get("numstories"),
        "yearbuilt": home.get("yearbuilt"),
        "sqft": home.get("sqft"),
        "acres": home.get("acres"),
        "fema_flood_zone": home.get("fema_flood_zone"),
        "fema_zone_desc": home.get("fema_zone_desc"),
        "crime_total": home.get("crime_total"),
        "crime_insurance_score": home.get("crime_insurance_score"),
        "storm_risk_score": home.get("storm_risk_score"),
    }

def get_all_addresses():
    homes = homes_collection.find().limit(100)
    return [_serialize_home(home) for home in homes]

def search_addresses_in_db(query):
    if not query or not query.strip():
        return []

    results = homes_collection.find(
        {
            "parcel_address": {
                "$regex": query,
                "$options": "i"
            }
        },
        {
            "_id": 1,
            "parcel_address": 1,
            "parcel_city": 1,
            "parcel_state": 1,
            "parcel_zip": 1
        }
    ).limit(10)

    formatted_results = []

    for item in results:
        street = item.get("parcel_address", "")
        city = item.get("parcel_city", "")
        state = item.get("parcel_state", "")
        zip_code = item.get("parcel_zip", "")

        full_address = f"{street}, {city}, {state} {zip_code}".strip()

        formatted_results.append({
            "id": str(item.get("_id")),
            "label": full_address,
            "street": street,
            "city": city,
            "state": state,
            "zip": zip_code
        })

    return formatted_results


def get_address_by_id(address_id):
    if not ObjectId.is_valid(address_id):
        return None

    home = homes_collection.find_one({"_id": ObjectId(address_id)})
    return _serialize_home(home)

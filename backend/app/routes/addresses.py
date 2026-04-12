from flask import Blueprint, jsonify, request

from app.services.address_service import (
    get_address_by_id,
    get_all_addresses,
    save_selected_address_to_final_json,
    search_addresses_in_db,
)

addresses_bp = Blueprint("addresses", __name__)

@addresses_bp.route("/addresses", methods=["GET"])
def get_addresses():
    return jsonify(get_all_addresses())

@addresses_bp.route("/addresses/search", methods=["GET"])
def search_addresses():
    query = request.args.get("q", "")
    results = search_addresses_in_db(query)
    return jsonify(results)


@addresses_bp.route("/addresses/select", methods=["POST"])
def select_address():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"error": "Expected a JSON object payload"}), 400

    address_id = payload.get("addressId")
    if not isinstance(address_id, str) or not address_id.strip():
        return jsonify({"error": "addressId is required"}), 400

    document = save_selected_address_to_final_json(address_id.strip())
    if not document:
        return jsonify({"error": "Address not found"}), 404

    return jsonify({"message": "Address saved to final.json", "address": document.get("address")})


@addresses_bp.route("/addresses/<address_id>", methods=["GET"])
def get_address(address_id):
    address = get_address_by_id(address_id)

    if not address:
        return jsonify({"error": "Address not found"}), 404

    return jsonify(address)

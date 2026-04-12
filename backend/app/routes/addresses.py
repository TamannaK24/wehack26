from flask import Blueprint, jsonify, request

from app.services.address_service import (
    get_address_by_id,
    get_all_addresses,
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


@addresses_bp.route("/addresses/<address_id>", methods=["GET"])
def get_address(address_id):
    address = get_address_by_id(address_id)

    if not address:
        return jsonify({"error": "Address not found"}), 404

    return jsonify(address)

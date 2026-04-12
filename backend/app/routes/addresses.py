from flask import Blueprint, jsonify
from app.services.address_service import get_all_addresses

addresses_bp = Blueprint("addresses", __name__)

@addresses_bp.route("/addresses", methods=["GET"])
def get_addresses():
    return jsonify(get_all_addresses())
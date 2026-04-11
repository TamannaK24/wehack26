from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    from app.risk import risk_bp
    app.register_blueprint(risk_bp, url_prefix="/api/risk")

    return app
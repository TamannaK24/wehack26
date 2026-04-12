from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)

    from app.risk import risk_bp
    app.register_blueprint(risk_bp, url_prefix="/api")

    return app

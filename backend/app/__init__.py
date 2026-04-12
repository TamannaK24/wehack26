from flask import Flask
from flask_cors import CORS

from app.routes.addresses import addresses_bp
from app.routes.chatbot import chatbot_bp
from app.routes.claims import claims_bp
from app.routes.photos import photos_bp
from app.routes.quiz import quiz_bp
from app.routes.risk import risk_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    @app.route("/")
    def home():
        return "Backend is running!"

    app.register_blueprint(addresses_bp)
    app.register_blueprint(claims_bp)
    app.register_blueprint(photos_bp)
    app.register_blueprint(quiz_bp)
    app.register_blueprint(risk_bp)
    app.register_blueprint(chatbot_bp, url_prefix="/api")

    return app

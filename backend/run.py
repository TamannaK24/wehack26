import os

from app import create_app

app = create_app()

if __name__ == "__main__":
    # Default 5050: macOS often reserves 5000 for AirPlay Receiver (System Settings → General → AirDrop & Handoff).
    port = int(os.getenv("PORT", "5050"))
    app.run(debug=True, port=port)
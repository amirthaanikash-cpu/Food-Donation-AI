import os
import sys

# Add backend folder to Python path
backend_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "backend")
)

sys.path.insert(0, backend_path)

# Import Flask app from backend/app.py
from app import app as flask_app

# Vercel expects a top-level variable named "app"
app = flask_app
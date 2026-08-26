import os
import sys

# Add the backend directory to Python's import path
backend_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "backend")
)

sys.path.insert(0, backend_path)

# Import the Flask application
try:
    from app import app  # type: ignore[reportMissingImports]
except ImportError:
    from backend.app import app
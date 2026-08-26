import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from backend/.env
load_dotenv()

from routes.donation import donation
from routes.auth import auth
from routes.admin import admin
from routes.assistant import assistant

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

app.register_blueprint(auth)
app.register_blueprint(donation)
app.register_blueprint(admin)
app.register_blueprint(assistant)

@app.route("/")
def home():
    return {
        "status":"success",
        "message":"Smart Food Donation AI Backend Running"
    }

if __name__=="__main__":
    app.run(debug=True)
    
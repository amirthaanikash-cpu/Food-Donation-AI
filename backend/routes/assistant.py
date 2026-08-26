import os
import json
import urllib.request
from flask import Blueprint, request, jsonify

assistant = Blueprint("assistant", __name__)

# System instructions to style the Gemini responses cleanly for our UI
SYSTEM_INSTRUCTION = (
    "You are the Smart Food Donation AI Assistant, an interactive chatbot for Smart Food Donation (a smart food donation platform).\n"
    "Your goal is to help users (donors, NGOs, volunteers) navigate the application and understand food donation practices, "
    "food safety guidelines, storage details, and NGO matching.\n\n"
    "Rules:\n"
    "1. Respond in clean, semantic HTML format (e.g. use <p>, <ul>, <li>, <strong>, <a>, <br> as needed). Do not include "
    "<html>, <body>, or <head> tags.\n"
    "2. If you refer to navigation in the app, link to the appropriate pages:\n"
    "   - Donate Food page: <a href=\"donate.html\">Donate Food</a>\n"
    "   - Dashboard: <a href=\"dashboard.html\">Dashboard</a>\n"
    "   - My Donations: <a href=\"mydonations.html\">My Donations</a>\n"
    "   - NGO list: <a href=\"ngo.html\">NGOs</a>\n"
    "   - Volunteer page: <a href=\"volunteer.html\">Volunteers</a>\n"
    "3. Keep your answers polite, helpful, and concise.\n"
    "4. Align your advice with the application's goals: reducing food waste and matching fresh food with local shelters."
)

@assistant.route("/assistant/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    message = data.get("message", "").strip()
    history = data.get("history", [])

    if not message:
        return jsonify({
            "status": "error",
            "message": "Message is required"
        }), 400

    api_key = os.environ.get("GEMINI_API_KEY")

    # If API key is not configured, send a helpful setup instruction response
    if not api_key:
        setup_message = (
            "<p>👋 Hello! I am the Smart Food Donation AI Assistant.</p>"
            "<div style='border: 1px solid #ffeeba; background-color: #fff3cd; color: #856404; padding: 12px; border-radius: 8px; margin-top: 10px; margin-bottom: 10px; font-size: 14px;'>"
            "<strong>⚠️ Gemini API Key is missing!</strong><br>"
            "To activate my real-time AI capabilities, please follow these steps:<br>"
            "<ol style='margin-top: 5px; margin-bottom: 5px; padding-left: 20px;'>"
            "<li>Create a <code>.env</code> file in the <code>backend/</code> directory.</li>"
            "<li>Add this line to it: <code>GEMINI_API_KEY=your_actual_api_key</code></li>"
            "<li>Restart the Flask backend server.</li>"
            "</ol>"
            "You can obtain a free API key from <a href='https://aistudio.google.com/' target='_blank' style='color: #0056b3; text-decoration: underline;'>Google AI Studio</a>.<br>"
            "<em>Currently running in offline simulation mode.</em>"
            "</div>"
        )
        return jsonify({
            "status": "success",
            "reply": setup_message,
            "api_key_configured": False
        })

    # Prepare conversation payload for Gemini API
    # Schema matches the standard gemini content payload structure
    contents = []
    
    # Process history (if any)
    for chat_msg in history:
        role = chat_msg.get("role")
        text = chat_msg.get("text", "")
        # Map assistant role 'model' to Gemini 'model', user to 'user'
        gemini_role = "model" if role == "model" else "user"
        contents.append({
            "role": gemini_role,
            "parts": [{"text": text}]
        })
        
    # Append current message
    contents.append({
        "role": "user",
        "parts": [{"text": message}]
    })

    payload = {
        "contents": contents,
        "systemInstruction": {
            "parts": [{"text": SYSTEM_INSTRUCTION}]
        },
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 1000
        }
    }

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    req_data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=req_data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body)
            
            # Extract text from response structure
            candidates = res_json.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    reply_html = parts[0].get("text", "")
                    return jsonify({
                        "status": "success",
                        "reply": reply_html,
                        "api_key_configured": True
                    })
            
            return jsonify({
                "status": "error",
                "message": "Empty response from Gemini API"
            }), 500

    except Exception as e:
        print("Gemini API Error:", str(e))
        return jsonify({
            "status": "error",
            "message": f"Failed to connect to Gemini API: {str(e)}"
        }), 500

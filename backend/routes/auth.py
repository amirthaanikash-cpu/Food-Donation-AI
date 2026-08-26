from flask import Blueprint, request, jsonify
from database import users
import bcrypt

auth = Blueprint("auth", __name__)

@auth.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    # Check existing user
    if users.find_one({"email": email}):
        return jsonify({
            "status": "error",
            "message": "Email already exists"
        }), 400

    # Encrypt password
    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )

    user = {
        "name": name,
        "email": email,
        "password": hashed_password,
        "role": role
    }

    users.insert_one(user)

    return jsonify({
        "status": "success",
        "message": "Registration Successful"
    })
@auth.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    # ===== Debug Prints =====
    print("Received Data:", data)
    print("Email:", email)
    print("Password:", password)

    user = users.find_one({"email": email})

    print("User:", user)

    if not user:
        return jsonify({
            "status": "error",
            "message": "User not found"
        }), 404

    if not bcrypt.checkpw(
        password.encode("utf-8"),
        user["password"]
    ):
        return jsonify({
            "status": "error",
            "message": "Incorrect password"
        }), 401

    return jsonify({
        "status": "success",
        "message": "Login Successful",
        "name": user["name"],
        "role": user["role"]
    })
@auth.route("/test")
def test():

    users.insert_one({
        "name": "Karthikeyan",
        "email": "test@gmail.com"
    })

    return {
        "message": "User inserted successfully"
    }
@auth.route("/allusers")
def all_users():

    data = []

    for user in users.find():

        data.append({
            "name": user.get("name"),
            "email": user.get("email"),
            "role": user.get("role")
        })

    return jsonify(data)
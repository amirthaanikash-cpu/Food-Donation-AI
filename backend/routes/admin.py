from flask import Blueprint, jsonify
from database import donations, users

admin = Blueprint("admin", __name__)

@admin.route("/admin/dashboard", methods=["GET"])
def dashboard():

    total_users = users.count_documents({})

    total_donations = donations.count_documents({})

    waiting = donations.count_documents({"status": "Waiting"})

    accepted = donations.count_documents({"status": "Accepted"})

    picked = donations.count_documents({"status": "Picked"})

    delivered = donations.count_documents({"status": "Delivered"})

    veg = donations.count_documents({"category": "Veg"})

    nonveg = donations.count_documents({"category": "Non-Veg"})

    recent = []

    for item in donations.find().sort("_id", -1).limit(5):

        item["_id"] = str(item["_id"])

        recent.append(item)

    return jsonify({

        "status": "success",

        "total_users": total_users,

        "total_donations": total_donations,

        "waiting": waiting,

        "accepted": accepted,

        "picked": picked,

        "delivered": delivered,

        "veg": veg,

        "nonveg": nonveg,

        "recent": recent

    })
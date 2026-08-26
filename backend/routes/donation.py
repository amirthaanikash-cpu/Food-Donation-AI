from flask import Blueprint, request, jsonify
from database import donations
from bson.objectid import ObjectId
from datetime import datetime
from routes.ai import check_food_freshness, get_priority
from routes.matching_ai import recommend_ngo
donation = Blueprint("donation", __name__)


# ==========================
# SAVE DONATION
# ==========================
@donation.route("/accept/<id>", methods=["PUT"])
def accept_donation(id):
    data = request.get_json(silent=True) or {}
    ngo_name = data.get("ngo") or request.args.get("ngo") or "Helping Hands NGO"

    donations.update_one(
        {"_id": ObjectId(id)},
        {
            "$set": {
                "status": "Accepted",
                "ngo": ngo_name,
                "accepted_at": datetime.now().strftime("%d-%m-%Y %I:%M %p")
            }
        }
    )

    return jsonify({
        "status": "success",
        "message": "Donation Accepted"
    })
@donation.route("/donate", methods=["POST"])
def donate():

    data = request.get_json()

    food_name = data.get("food_name")
    quantity = data.get("quantity")
    category = data.get("category")
    prepared_time = data.get("prepared_time")
    storage = data.get("storage")
    expiry = data.get("expiry")
    address = data.get("address")
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    donor_email = data.get("donor_email")
    
    # AI Food Analysis
    ai_result = check_food_freshness(expiry)
    priority = get_priority(ai_result["freshness"])
    ngo = recommend_ngo(category, latitude, longitude)
    donation_data = {

    "food_name": food_name,
    "quantity": quantity,
    "category": category,
    "prepared_time": prepared_time,
    "storage": storage,
    "expiry": expiry,
    "address": address,
    "latitude": latitude,
    "longitude": longitude,
    "donor_email": donor_email,

    # AI Analysis
    "freshness": ai_result["freshness"],
    "ai_result": ai_result["result"],
    "recommendation": ai_result["recommendation"],
    "priority": priority,

    # NGO Recommendation
    "recommended_ngo": ngo["name"],
    "distance": ngo["distance"],

    # Donation Status
    "status": "Waiting",
    "ngo": "",
    "volunteer": "",

    "created_at": datetime.now().strftime("%d-%m-%Y %I:%M %p"),
    "accepted_at": "",
    "picked_at": "",
    "delivered_at": ""

}

    donations.insert_one(donation_data)

    return jsonify({
        "status": "success",
        "message": "Food Donation Submitted Successfully"
    })
@donation.route("/accepted-donations", methods=["GET"])
def accepted_donations():

    accepted = []

    for item in donations.find({

    "status": {

        "$in": ["Accepted", "Picked"]

    }

}):

        item["_id"] = str(item["_id"])

        accepted.append(item)

    return jsonify({

        "status": "success",

        "data": accepted

    })

@donation.route("/pickup/<id>", methods=["PUT"])
def pickup(id):
    data = request.get_json(silent=True) or {}
    volunteer_name = data.get("volunteer") or request.args.get("volunteer") or "Arun Kumar"

    donations.update_one(
        {"_id": ObjectId(id)},
        {
            "$set":{
                "status":"Picked",
                "volunteer":volunteer_name,
                "picked_at":datetime.now().strftime("%d-%m-%Y %I:%M %p")
            }
        }
    )

    return jsonify({
        "status":"success",
        "message":"Food Picked Successfully"
    })
# ==========================
# DELIVER FOOD
# ==========================

@donation.route("/deliver/<id>", methods=["PUT"])
def deliver(id):

    donations.update_one(

        {"_id": ObjectId(id)},

        {
            "$set":{
                "status":"Delivered",
                "delivered_at":datetime.now().strftime("%d-%m-%Y %I:%M %p")
            }
        }

    )

    return jsonify({
        "status":"success",
        "message":"Food Delivered Successfully"
    })
# ==========================
# GET ALL DONATIONS
# ==========================

@donation.route("/donations", methods=["GET"])
def get_donations():

    all_donations = []

    for item in donations.find():

        item["_id"] = str(item["_id"])

        all_donations.append(item)

    return jsonify({
        "status": "success",
        "data": all_donations
    })
import os
import bcrypt
from pymongo import MongoClient
from datetime import datetime, timedelta

def seed():
    client = MongoClient("mongodb://localhost:27017/")
    db = client["smart_food_donation_ai"]
    
    # 1. Clear and Seed Users Collection
    db.users.drop()
    
    # Create password hash for 'password123'
    hashed_pwd = bcrypt.hashpw("password123".encode("utf-8"), bcrypt.gensalt())
    
    users_list = [
        {
            "name": "Test Donor",
            "email": "donor@test.com",
            "password": hashed_pwd,
            "role": "donor"
        },
        {
            "name": "Helping Hands NGO",
            "email": "ngo@test.com",
            "password": hashed_pwd,
            "role": "ngo"
        },
        {
            "name": "Vikas Dubey",
            "email": "volunteer@test.com",
            "password": hashed_pwd,
            "role": "volunteer"
        }
    ]
    
    db.users.insert_many(users_list)
    print("Successfully seeded 3 default users (donor@test.com, ngo@test.com, volunteer@test.com) with password 'password123'!")
    
    # 2. Clear and Seed Donations Collection
    db.donations.drop()
    
    donations_list = []
    
    # 15 Waiting Donations (available for NGO to accept)
    waiting_good_foods = [
        ("Paneer Butter Masala & Roti", "Veg", 20, 95, "Safe", "Food is fresh. Collect within 4 hours.", "Low"),
        ("Sambar Rice & Potato Fry", "Veg", 30, 90, "Safe", "Food is fresh. Collect within 4 hours.", "Low"),
        ("Chicken Biryani", "Non Veg", 40, 95, "Safe", "Food is fresh. Collect within 4 hours.", "Low"),
        ("Mutton Gravy & Parotta", "Non Veg", 25, 92, "Safe", "Food is fresh. Collect within 4 hours.", "Low"),
        ("Assorted Cupcakes", "Bakery", 15, 96, "Safe", "Food is fresh. Collect within 4 hours.", "Low"),
        ("Fresh Chocolate Donuts", "Bakery", 12, 94, "Safe", "Food is fresh. Collect within 4 hours.", "Low"),
        ("Mixed Cut Fruits", "Fruits", 10, 85, "Good", "Collect within 2 hours.", "Medium"),
        ("Organic Bananas", "Fruits", 50, 98, "Safe", "Food is fresh. Collect within 4 hours.", "Low"),
        ("Vegetable Pulao", "Veg", 35, 88, "Safe", "Food is fresh. Collect within 4 hours.", "Low"),
        ("Fish Fry & Rice", "Non Veg", 15, 85, "Good", "Collect within 2 hours.", "Medium")
    ]
    
    waiting_bad_foods = [
        ("Curd Rice (Leftover)", "Veg", 10, 30, "Unsafe", "Food is about to expire.", "Very High"),
        ("Cream Bun", "Bakery", 8, 35, "Unsafe", "Food is about to expire.", "Very High"),
        ("Overripe Mangoes", "Fruits", 15, 20, "Expired", "Do not donate this food.", "Very High"),
        ("Egg Fried Rice", "Non Veg", 12, 10, "Expired", "Do not donate this food.", "Very High"),
        ("Tomato Sadham", "Veg", 18, 25, "Unsafe", "Food is about to expire.", "Very High")
    ]
    
    for idx, (food, cat, qty, fresh, res, rec, pri) in enumerate(waiting_good_foods + waiting_bad_foods):
        donations_list.append({
            "food_name": food,
            "category": cat,
            "quantity": qty,
            "prepared_time": "11:00",
            "storage": "Refrigerated" if idx % 2 == 0 else "Room Temperature",
            "expiry": "23:00" if fresh > 50 else "12:00",
            "address": f"Donor House No {idx+1}, KK Nagar, Madurai",
            "latitude": 9.9252 + (idx * 0.001),
            "longitude": 78.1198 - (idx * 0.001),
            "donor_email": "donor@test.com",
            "freshness": fresh,
            "ai_result": res,
            "recommendation": rec,
            "priority": pri,
            "recommended_ngo": "Helping Hands NGO" if cat == "Veg" else "Food Care Trust" if cat == "Non-Veg" else "Hope Foundation" if cat == "Bakery" else "Smile Charity",
            "distance": f"{round(1.0 + idx * 0.3, 1)} km",
            "status": "Waiting",
            "ngo": "",
            "volunteer": "",
            "created_at": (datetime.now() - timedelta(hours=idx)).strftime("%d-%m-%Y %I:%M %p"),
            "accepted_at": "",
            "picked_at": "",
            "delivered_at": ""
        })
        
    # 15 Accepted Donations (NGO accepted them)
    accepted_foods = [
        ("Veg Meals Packets", "Veg", 50, 95, "Safe", "Helping Hands NGO"),
        ("Chapati & Veg Kurma", "Veg", 25, 90, "Safe", "Helping Hands NGO"),
        ("Egg Biryani", "Non Veg", 30, 95, "Safe", "Food Care Trust"),
        ("Butter Biscuits", "Bakery", 60, 97, "Safe", "Hope Foundation"),
        ("Apple Basket", "Fruits", 20, 96, "Safe", "Smile Charity"),
        ("Veg Fried Rice", "Veg", 15, 60, "Average", "Helping Hands NGO"),
        ("Chicken Noodles", "Non Veg", 22, 62, "Average", "Food Care Trust"),
        ("Garlic Bread", "Bakery", 14, 88, "Safe", "Hope Foundation"),
        ("Papaya Slices", "Fruits", 8, 35, "Unsafe", "Smile Charity"),
        ("Jeera Rice & Dal", "Veg", 30, 92, "Safe", "Helping Hands NGO"),
        ("Fish Curry", "Non Veg", 18, 25, "Unsafe", "Food Care Trust"),
        ("White Bread Loaves", "Bakery", 10, 90, "Safe", "Hope Foundation"),
        ("Orange Basket", "Fruits", 15, 92, "Safe", "Smile Charity"),
        ("Lemon Rice", "Veg", 20, 85, "Good", "Helping Hands NGO"),
        ("Chicken Manchurian", "Non Veg", 12, 30, "Unsafe", "Food Care Trust")
    ]
    
    for idx, (food, cat, qty, fresh, res, ngo_name) in enumerate(accepted_foods):
        donations_list.append({
            "food_name": food,
            "category": cat,
            "quantity": qty,
            "prepared_time": "10:00",
            "storage": "Refrigerated" if idx % 2 == 0 else "Room Temperature",
            "expiry": "22:00",
            "address": f"Donor House No {idx+20}, Anna Nagar, Madurai",
            "latitude": 9.9212 + (idx * 0.001),
            "longitude": 78.1238 - (idx * 0.001),
            "donor_email": "donor@test.com",
            "freshness": fresh,
            "ai_result": res,
            "recommendation": "Collect as soon as possible.",
            "priority": "Low" if fresh > 70 else "Medium" if fresh > 50 else "High",
            "recommended_ngo": ngo_name,
            "distance": f"{round(0.8 + idx * 0.2, 1)} km",
            "status": "Accepted",
            "ngo": ngo_name,
            "volunteer": "",
            "created_at": (datetime.now() - timedelta(hours=idx+2)).strftime("%d-%m-%Y %I:%M %p"),
            "accepted_at": (datetime.now() - timedelta(minutes=30)).strftime("%d-%m-%Y %I:%M %p"),
            "picked_at": "",
            "delivered_at": ""
        })
        
    # 10 Picked Donations (Volunteer picked them up)
    picked_foods = [
        ("Idli & Chutney", "Veg", 40, 92, "Helping Hands NGO", "Ramesh Kumar"),
        ("Veg Biryani Combo", "Veg", 25, 95, "Helping Hands NGO", "Suresh Raina"),
        ("Chicken Fried Rice", "Non Veg", 30, 94, "Food Care Trust", "Vikas Dubey"),
        ("Sweet Buns", "Bakery", 50, 96, "Hope Foundation", "Karthik Raja"),
        ("Guava Basket", "Fruits", 15, 90, "Smile Charity", "Dinesh Karthik"),
        ("Tomato Rice", "Veg", 15, 65, "Helping Hands NGO", "Ramesh Kumar"),
        ("Mutton Biryani", "Non Veg", 20, 95, "Food Care Trust", "Vikas Dubey"),
        ("Pineapple Slices", "Fruits", 10, 30, "Smile Charity", "Dinesh Karthik"),
        ("Potato Chips Packets", "Bakery", 30, 98, "Hope Foundation", "Karthik Raja"),
        ("Veg Noodles", "Veg", 18, 85, "Helping Hands NGO", "Suresh Raina")
    ]
    
    for idx, (food, cat, qty, fresh, ngo_name, vol_name) in enumerate(picked_foods):
        donations_list.append({
            "food_name": food,
            "category": cat,
            "quantity": qty,
            "prepared_time": "09:00",
            "storage": "Refrigerated" if idx % 2 == 0 else "Room Temperature",
            "expiry": "21:00",
            "address": f"Donor House No {idx+40}, Sellur, Madurai",
            "latitude": 9.9322 + (idx * 0.001),
            "longitude": 78.1128 - (idx * 0.001),
            "donor_email": "donor@test.com",
            "freshness": fresh,
            "ai_result": "Safe" if fresh > 70 else "Average",
            "recommendation": "Deliver immediately.",
            "priority": "Low" if fresh > 70 else "Medium",
            "recommended_ngo": ngo_name,
            "distance": f"{round(1.5 + idx * 0.2, 1)} km",
            "status": "Picked",
            "ngo": ngo_name,
            "volunteer": vol_name,
            "created_at": (datetime.now() - timedelta(hours=idx+3)).strftime("%d-%m-%Y %I:%M %p"),
            "accepted_at": (datetime.now() - timedelta(hours=1)).strftime("%d-%m-%Y %I:%M %p"),
            "picked_at": (datetime.now() - timedelta(minutes=15)).strftime("%d-%m-%Y %I:%M %p"),
            "delivered_at": ""
        })

    # 15 Delivered Donations (Finished)
    delivered_foods = [
        ("Pongal & Vadai", "Veg", 30, 90, "Helping Hands NGO", "Ramesh Kumar"),
        ("Veg Pulao & Raita", "Veg", 25, 95, "Helping Hands NGO", "Suresh Raina"),
        ("Chicken Curry & Rice", "Non Veg", 35, 92, "Food Care Trust", "Vikas Dubey"),
        ("Croissants Basket", "Bakery", 24, 96, "Hope Foundation", "Karthik Raja"),
        ("Pomegranate Seeds", "Fruits", 12, 90, "Smile Charity", "Dinesh Karthik"),
        ("Curd Rice Combo", "Veg", 20, 85, "Helping Hands NGO", "Ramesh Kumar"),
        ("Egg Masala & Chapatis", "Non Veg", 18, 91, "Food Care Trust", "Vikas Dubey"),
        ("Banana Cake", "Bakery", 15, 95, "Hope Foundation", "Karthik Raja"),
        ("Grape Bunches", "Fruits", 8, 88, "Smile Charity", "Dinesh Karthik"),
        ("Sambar & Rice Packets", "Veg", 50, 92, "Helping Hands NGO", "Suresh Raina"),
        ("Chicken Pepper Fry", "Non Veg", 15, 35, "Food Care Trust", "Vikas Dubey"),
        ("Plain Cakes", "Bakery", 10, 94, "Hope Foundation", "Karthik Raja"),
        ("Watermelon Bowls", "Fruits", 20, 90, "Smile Charity", "Dinesh Karthik"),
        ("Mushroom Biryani", "Veg", 25, 95, "Helping Hands NGO", "Ramesh Kumar"),
        ("Bread Butter Jam", "Bakery", 40, 96, "Hope Foundation", "Karthik Raja")
    ]
    
    for idx, (food, cat, qty, fresh, ngo_name, vol_name) in enumerate(delivered_foods):
        donations_list.append({
            "food_name": food,
            "category": cat,
            "quantity": qty,
            "prepared_time": "08:00",
            "storage": "Refrigerated" if idx % 2 == 0 else "Room Temperature",
            "expiry": "20:00",
            "address": f"Donor House No {idx+55}, Tallakulam, Madurai",
            "latitude": 9.9412 + (idx * 0.001),
            "longitude": 78.1348 - (idx * 0.001),
            "donor_email": "donor@test.com",
            "freshness": fresh,
            "ai_result": "Safe" if fresh > 50 else "Unsafe",
            "recommendation": "Delivered successfully.",
            "priority": "Low",
            "recommended_ngo": ngo_name,
            "distance": f"{round(2.0 + idx * 0.1, 1)} km",
            "status": "Delivered",
            "ngo": ngo_name,
            "volunteer": vol_name,
            "created_at": (datetime.now() - timedelta(days=1, hours=idx)).strftime("%d-%m-%Y %I:%M %p"),
            "accepted_at": (datetime.now() - timedelta(days=1, minutes=45)).strftime("%d-%m-%Y %I:%M %p"),
            "picked_at": (datetime.now() - timedelta(days=1, minutes=30)).strftime("%d-%m-%Y %I:%M %p"),
            "delivered_at": (datetime.now() - timedelta(days=1, minutes=10)).strftime("%d-%m-%Y %I:%M %p")
        })

    db.donations.insert_many(donations_list)
    print(f"Successfully seeded {len(donations_list)} donations into 'donations' collection!")

if __name__ == "__main__":
    seed()

from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")

db = client["smart_food_donation_ai"]

users = db["users"]

donations = db["donations"]
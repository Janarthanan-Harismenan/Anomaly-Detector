from fastapi import FastAPI, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import joblib
import numpy as np
import re
from pydantic import BaseModel, EmailStr, Field
from pymongo import MongoClient
from passlib.context import CryptContext
import jwt
import datetime
import requests

# MongoDB connection
client = MongoClient("mongodb://localhost:27017")
db = client["user_database"]
users_collection = db["users"]

# FastAPI app instance
app = FastAPI()

# CORS middleware to allow requests from React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Load JSON data once during startup for the /data endpoint
json_file_path = "C:/Users/Harismenan/OneDrive/Desktop/Projects/Data Science Project/Web App/Back end/Dummy.json"

# Load the pre-trained anomaly detection model
model = joblib.load("anomaly_detection_model.sav")

# Load JSON data
data = None
@app.on_event("startup")
def load_json_data():
    global data
    with open(json_file_path) as f:
        data = json.load(f)

# Request model for anomaly detection
class AnomalyDetectionInput(BaseModel):
    container_fs_usage_bytes: float
    container_memory_rss: float
    container_cpu_system_seconds_total: float
    container_network_receive_bytes_total: float
    container_network_receive_errors_total: float
    container_memory_failures_total: float

# Response model
class AnomalyDetectionResponse(BaseModel):
    input_data: AnomalyDetectionInput
    anomaly_class: int

class LoginInput(BaseModel):
    email: str
    password: str

class SignupInput(BaseModel):
    name: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)

class ContactForm(BaseModel):
    name: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    message: str = Field(..., min_length=5)

# Utility functions for password handling
def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def validate_password_strength(password: str):
    if not re.match(r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$', password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character."
        )

# JWT token creation
SECRET_KEY = "your_secret_key_here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: datetime.timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/detect-anomalies-from-data", response_model=list[AnomalyDetectionResponse])
async def detect_anomalies_from_data():
    anomaly_results = []

    for item in data:
        input_data = AnomalyDetectionInput(
            container_fs_usage_bytes=item.get("container_fs_usage_bytes"),
            container_memory_rss=item.get("container_memory_rss"),
            container_cpu_system_seconds_total=item.get("container_cpu_system_seconds_total"),
            container_network_receive_bytes_total=item.get("container_network_receive_bytes_total"),
            container_network_receive_errors_total=item.get("container_network_receive_errors_total"),
            container_memory_failures_total=item.get("container_memory_failures_total"),
        )

        features = [
            input_data.container_fs_usage_bytes,
            input_data.container_memory_rss,
            input_data.container_cpu_system_seconds_total,
            input_data.container_network_receive_bytes_total,
            input_data.container_network_receive_errors_total,
            input_data.container_memory_failures_total
        ]

        prediction = model.predict([features])
        anomaly_class = int(prediction[0])

        anomaly_results.append(AnomalyDetectionResponse(input_data=input_data, anomaly_class=anomaly_class))

    return anomaly_results

@app.post("/signup")
def signup(user_data: SignupInput):
    if users_collection.find_one({"email": user_data.email}):
        raise HTTPException(status_code=400, detail="User already exists with this email")

    validate_password_strength(user_data.password)
    hashed_password = hash_password(user_data.password)

    users_collection.insert_one({
        "name": user_data.name,
        "email": user_data.email,
        "password": hashed_password
    })

    return {"message": "User registered successfully"}

@app.post("/login")
async def login(form_data: LoginInput):
    user = users_collection.find_one({"email": form_data.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect password")

    access_token_expires = datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user["email"]}, expires_delta=access_token_expires)

    return {"access_token": access_token, "token_type": "bearer", "user_id": str(user["_id"])}

@app.post("/detect-anomaly")
async def detect_anomaly(input_data: AnomalyDetectionInput):
    features = [
        input_data.container_fs_usage_bytes,
        input_data.container_memory_rss,
        input_data.container_cpu_system_seconds_total,
        input_data.container_network_receive_bytes_total,
        input_data.container_network_receive_errors_total,
        input_data.container_memory_failures_total
    ]

    prediction = model.predict([features])
    anomaly_class = int(prediction[0])

    return {"anomaly_class": anomaly_class}

# Serve JSON data from the file on a separate route
@app.get("/data")
async def serve_json():
    return data

# Email sending using EmailJS
@app.post("/send-email/")
async def send_email_emailjs(contact_form: ContactForm):
    EMAILJS_API_URL = "https://api.emailjs.com/api/v1.0/email/send"
    EMAILJS_SERVICE_ID = "service_vh6oywi"
    EMAILJS_TEMPLATE_ID = "template_anfen6n"
    EMAILJS_USER_ID = "LrWX5POGvvu-WhDUN"  # Use your public key here

    payload = {
        "service_id": EMAILJS_SERVICE_ID,
        "template_id": EMAILJS_TEMPLATE_ID,
        "user_id": EMAILJS_USER_ID,
        "template_params": {
            "from_name": contact_form.name,
            "from_email": contact_form.email,
            "message": contact_form.message,
        }
    }

    try:
        response = requests.post(EMAILJS_API_URL, json=payload)
        response_data = response.json()  # Get the JSON response from EmailJS
        if response.status_code == 200:
            return JSONResponse(content={"message": "Email sent successfully!"}, status_code=200)
        else:
            return JSONResponse(content={"error": f"Failed to send email. Response: {response_data}"}, status_code=response.status_code)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
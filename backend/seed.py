import requests
import json
import os
import sys

API = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8000") + "/api"

teachers = [
    {
        "email": "ritu.das@example.com",
        "name": "Ritu Das",
        "phone": "+919864000001",
        "profile": {
            "qualification": "MSc",
            "subjects": ["Mathematics", "Physics"],
            "classes": ["Class 9", "Class 10", "Class 11", "Class 12"],
            "experience_years": 8,
            "location_area": "Chowkidingee",
            "tuition_modes": ["home", "online"],
            "fee_per_month": 3500,
            "fee_per_hour": 300,
            "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri"],
            "availability_time": "5-8pm",
            "description": "Board specialist for CBSE & SEBA. 8 years of coaching Class 10-12 with 90%+ result track."
        }
    },
    {
        "email": "arup.gogoi@example.com",
        "name": "Arup Gogoi",
        "phone": "+919864000002",
        "profile": {
            "qualification": "BEd",
            "subjects": ["Assamese", "English", "Social Science"],
            "classes": ["Class 5", "Class 6", "Class 7", "Class 8"],
            "experience_years": 12,
            "location_area": "Naliapool",
            "tuition_modes": ["home", "teacher_place"],
            "fee_per_month": 2500,
            "availability_days": ["Mon", "Wed", "Fri", "Sat"],
            "availability_time": "4-7pm",
            "description": "Experienced middle-school tutor focussing on strong foundations and Assamese literature."
        }
    },
    {
        "email": "priya.sharma@example.com",
        "name": "Priya Sharma",
        "phone": "+919864000003",
        "profile": {
            "qualification": "MSc",
            "subjects": ["Chemistry", "Biology"],
            "classes": ["Class 11", "Class 12", "Competitive Exams"],
            "experience_years": 6,
            "location_area": "Amolapatty",
            "tuition_modes": ["home", "online"],
            "fee_per_month": 4500,
            "fee_per_hour": 400,
            "availability_days": ["Tue", "Thu", "Sat", "Sun"],
            "availability_time": "6-9pm",
            "description": "NEET aspirants coaching with strong lab-based conceptual teaching."
        }
    },
    {
        "email": "rohit.borah@example.com",
        "name": "Rohit Borah",
        "phone": "+919864000004",
        "profile": {
            "qualification": "Engineering (BTech)",
            "subjects": ["Mathematics", "Computer Science"],
            "classes": ["Class 9", "Class 10", "Class 11", "Class 12", "College / BSc"],
            "experience_years": 4,
            "location_area": "Milan Nagar",
            "tuition_modes": ["online", "home"],
            "fee_per_month": 3000,
            "fee_per_hour": 250,
            "availability_days": ["Mon", "Tue", "Wed", "Thu"],
            "availability_time": "7-10pm",
            "description": "IIT graduate. Loves teaching problem-solving and Python."
        }
    },
    {
        "email": "nirmali.baruah@example.com",
        "name": "Nirmali Baruah",
        "phone": "+919864000005",
        "profile": {
            "qualification": "MA",
            "subjects": ["English", "Hindi", "History"],
            "classes": ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"],
            "experience_years": 15,
            "location_area": "Graham Bazar",
            "tuition_modes": ["home"],
            "fee_per_month": 2800,
            "availability_days": ["Mon", "Tue", "Wed", "Thu", "Fri"],
            "availability_time": "3-6pm",
            "description": "Retired school teacher. Now offering home tuition for middle & high school English/History."
        }
    },
    {
        "email": "bikash.tamuli@example.com",
        "name": "Bikash Tamuli",
        "phone": "+919864000006",
        "profile": {
            "qualification": "MSc",
            "subjects": ["Physics", "Mathematics"],
            "classes": ["Class 11", "Class 12", "Competitive Exams"],
            "experience_years": 10,
            "location_area": "Jalan Nagar",
            "tuition_modes": ["teacher_place", "online"],
            "fee_per_month": 5000,
            "fee_per_hour": 500,
            "availability_days": ["Sat", "Sun"],
            "availability_time": "9am-6pm (weekends)",
            "description": "JEE Mains/Advanced focus. Weekend intensive batches."
        }
    }
]

def main():
    print(f"Connecting to {API}...")
    # Admin login
    admin_r = requests.post(f"{API}/auth/login", json={"email": "admin@dibrugarhtuition.in", "password": "Admin@123"})
    if admin_r.status_code != 200:
        print("Admin login failed. Is the server running?")
        sys.exit(1)
    
    admin_token = admin_r.json()["token"]
    admin_hdr = {"Authorization": f"Bearer {admin_token}"}

    for t in teachers:
        r = requests.post(f"{API}/auth/signup", json={"email": t["email"], "password": "Teacher@123", "name": t["name"], "phone": t["phone"], "role": "teacher"})
        if r.status_code >= 400:
            r = requests.post(f"{API}/auth/login", json={"email": t["email"], "password": "Teacher@123"})
        tok = r.json()["token"]
        hdr = {"Authorization": f"Bearer {tok}"}
        prof_data = {"name": t["name"], **t["profile"]}
        pr = requests.post(f"{API}/teachers/profile", json=prof_data, headers=hdr)
        prof = pr.json()
        requests.patch(f"{API}/admin/teachers/{prof['id']}/verify?verified=true", headers=admin_hdr)
        print("Seeded teacher:", t["name"])

    # Demo student
    sr = requests.post(f"{API}/auth/signup", json={"email": "parent@example.com", "password": "Parent@123", "name": "Anjali Parent", "phone": "+919000000000", "role": "student"})
    if sr.status_code >= 400:
        sr = requests.post(f"{API}/auth/login", json={"email": "parent@example.com", "password": "Parent@123"})
    print("Seeded student user (parent@example.com)")

    stats = requests.get(f"{API}/stats").json()
    print("Database seeding completed! Current stats:", stats)

if __name__ == "__main__":
    main()

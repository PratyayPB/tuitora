from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import re
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get("DB_NAME", "tuitora_database")]

JWT_SECRET = os.environ.get("JWT_SECRET", "dibrugarh-tuition-secret-change-me")
JWT_ALGO = "HS256"
JWT_EXPIRE_HOURS = 24 * 7

app = FastAPI(title="Tuitora API")
api = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)


# ============= Helpers =============
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def require_role(user, *roles):
    if user["role"] not in roles:
        raise HTTPException(status_code=403, detail="Forbidden")


# ============= Models =============
class SignupIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str
    phone: str
    role: Literal["student", "teacher"]


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TeacherProfileIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    qualification: str
    subjects: List[str]
    classes: List[str]
    experience_years: int = Field(ge=0)
    location_area: str
    tuition_modes: List[str]
    fee_per_month: int = Field(ge=0)
    fee_per_hour: Optional[int] = None
    availability_days: List[str] = []
    availability_time: Optional[str] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None


class StudentRequirementIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    student_name: str
    class_std: str
    school_name: Optional[str] = None
    subjects: List[str]
    preferred_modes: List[str]
    preferred_area: str
    preferred_time: Optional[str] = None
    budget_min: int = Field(ge=0)
    budget_max: int = Field(ge=0)
    description: Optional[str] = None


class TuitionRequestIn(BaseModel):
    teacher_id: str
    subject: str
    class_std: str
    preferred_area: str
    preferred_time: Optional[str] = None
    budget: Optional[int] = None
    message: Optional[str] = None


class RequestStatusIn(BaseModel):
    status: Literal["accepted", "rejected"]


class ReportIn(BaseModel):
    target_user_id: str
    reason: str


# ============= Dibrugarh whitelisted areas =============
DIBRUGARH_AREAS = [
    "Chowkidingee", "Naliapool", "Amolapatty", "Graham Bazar", "Mancotta",
    "Jalan Nagar", "Paltan Bazar", "Milan Nagar", "New Market", "Convoy Road",
    "Thana Chariali", "Aambari", "C.R. Building", "Lahoal", "Khanikar",
    "Barbari", "H.S. Road", "Seujpur", "Dibrugarh University", "Bordubi Road",
    "Rangagora Road", "Boiragimath", "Chiring Chapori", "Bogibeel", "Moran Road",
]


# ============= Auth Routes =============
@api.get("/")
async def root():
    return {"message": "Tuitora API"}


@api.post("/auth/signup")
async def signup(body: SignupIn):
    existing = await db.users.find_one({"email": body.email.lower()})
    if existing:
        raise HTTPException(400, "Email already registered")
    uid = str(uuid.uuid4())
    doc = {
        "id": uid,
        "email": body.email.lower(),
        "password_hash": hash_password(body.password),
        "name": body.name,
        "phone": body.phone,
        "role": body.role,
        "is_blocked": False,
        "created_at": now_iso(),
    }
    await db.users.insert_one(doc)
    token = create_token(uid, body.role)
    return {"token": token, "user": {k: v for k, v in doc.items() if k not in ("password_hash", "_id")}}


@api.post("/auth/login")
async def login(body: LoginIn):
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    if user.get("is_blocked"):
        raise HTTPException(403, "Your account has been blocked")
    token = create_token(user["id"], user["role"])
    user.pop("password_hash", None)
    user.pop("_id", None)
    return {"token": token, "user": user}


@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return user


# ============= Meta =============
@api.get("/meta/areas")
async def list_areas():
    return DIBRUGARH_AREAS


@api.get("/stats")
async def public_stats():
    tutors = await db.teacher_profiles.count_documents({"is_verified": True})
    all_tutors = await db.teacher_profiles.count_documents({})
    students = await db.users.count_documents({"role": "student"})
    requests = await db.tuition_requests.count_documents({})
    return {
        "verified_tutors": tutors,
        "total_tutors": all_tutors,
        "students": students,
        "requests": requests,
        "areas": len(DIBRUGARH_AREAS),
    }


# ============= Teacher Profile =============
@api.post("/teachers/profile")
async def upsert_teacher_profile(body: TeacherProfileIn, user=Depends(get_current_user)):
    await require_role(user, "teacher")
    if body.location_area not in DIBRUGARH_AREAS:
        raise HTTPException(400, "Location must be within Dibrugarh city")
    existing = await db.teacher_profiles.find_one({"user_id": user["id"]})
    data = body.model_dump()
    data.update({
        "user_id": user["id"],
        "email": user["email"],
        "phone": user["phone"],
        "updated_at": now_iso(),
    })
    if existing:
        data["id"] = existing["id"]
        data["is_verified"] = existing.get("is_verified", False)
        data["is_available"] = existing.get("is_available", True)
        data["created_at"] = existing.get("created_at", now_iso())
        await db.teacher_profiles.update_one({"id": existing["id"]}, {"$set": data})
    else:
        data["id"] = str(uuid.uuid4())
        data["is_verified"] = False
        data["is_available"] = True
        data["created_at"] = now_iso()
        await db.teacher_profiles.insert_one(data)
    data.pop("_id", None)
    return data


@api.get("/teachers/me")
async def my_teacher_profile(user=Depends(get_current_user)):
    await require_role(user, "teacher")
    prof = await db.teacher_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not prof:
        raise HTTPException(404, "Profile not created yet")
    return prof


@api.patch("/teachers/availability")
async def toggle_availability(is_available: bool, user=Depends(get_current_user)):
    await require_role(user, "teacher")
    await db.teacher_profiles.update_one({"user_id": user["id"]}, {"$set": {"is_available": is_available}})
    return {"ok": True}


@api.get("/teachers")
async def search_teachers(
    q: Optional[str] = None,
    subject: Optional[str] = None,
    class_std: Optional[str] = None,
    area: Optional[str] = None,
    mode: Optional[str] = None,
    min_fee: Optional[int] = None,
    max_fee: Optional[int] = None,
    min_experience: Optional[int] = None,
    verified_only: bool = False,
    limit: int = Query(50, le=100),
):
    filt = {}
    if verified_only:
        filt["is_verified"] = True
    if subject:
        filt["subjects"] = {"$regex": f"^{re.escape(subject)}$", "$options": "i"}
    if class_std:
        filt["classes"] = class_std
    if area:
        filt["location_area"] = area
    if mode:
        filt["tuition_modes"] = mode
    if min_fee is not None:
        filt.setdefault("fee_per_month", {})["$gte"] = min_fee
    if max_fee is not None:
        filt.setdefault("fee_per_month", {})["$lte"] = max_fee
    if min_experience is not None:
        filt["experience_years"] = {"$gte": min_experience}
    if q:
        filt["$or"] = [
            {"name": {"$regex": re.escape(q), "$options": "i"}},
            {"qualification": {"$regex": re.escape(q), "$options": "i"}},
            {"description": {"$regex": re.escape(q), "$options": "i"}},
        ]

    docs = await db.teacher_profiles.find(filt, {"_id": 0, "phone": 0, "email": 0}).to_list(limit)
    return docs


@api.get("/teachers/{teacher_id}")
async def get_teacher(teacher_id: str, user=Depends(get_current_user)):
    prof = await db.teacher_profiles.find_one({"id": teacher_id}, {"_id": 0})
    if not prof:
        raise HTTPException(404, "Teacher not found")

    # Hide phone unless: viewer is the teacher, admin, or accepted request exists
    can_see_phone = user["id"] == prof["user_id"] or user["role"] == "admin"
    if not can_see_phone:
        accepted = await db.tuition_requests.find_one({
            "student_user_id": user["id"],
            "teacher_user_id": prof["user_id"],
            "status": "accepted",
        })
        can_see_phone = accepted is not None
    if not can_see_phone:
        prof.pop("phone", None)
        prof.pop("email", None)
    return prof


# ============= Student Requirement =============
@api.post("/students/requirement")
async def upsert_requirement(body: StudentRequirementIn, user=Depends(get_current_user)):
    await require_role(user, "student")
    if body.preferred_area not in DIBRUGARH_AREAS:
        raise HTTPException(400, "Preferred area must be within Dibrugarh city")
    existing = await db.student_requirements.find_one({"user_id": user["id"]})
    data = body.model_dump()
    data.update({"user_id": user["id"], "updated_at": now_iso()})
    if existing:
        data["id"] = existing["id"]
        data["created_at"] = existing.get("created_at", now_iso())
        await db.student_requirements.update_one({"id": existing["id"]}, {"$set": data})
    else:
        data["id"] = str(uuid.uuid4())
        data["created_at"] = now_iso()
        await db.student_requirements.insert_one(data)
    data.pop("_id", None)
    return data


@api.get("/students/requirement")
async def get_my_requirement(user=Depends(get_current_user)):
    await require_role(user, "student")
    req = await db.student_requirements.find_one({"user_id": user["id"]}, {"_id": 0})
    return req


@api.delete("/students/requirement")
async def delete_requirement(user=Depends(get_current_user)):
    await require_role(user, "student")
    await db.student_requirements.delete_one({"user_id": user["id"]})
    return {"ok": True}


# ============= Tuition Requests =============
@api.post("/requests")
async def create_request(body: TuitionRequestIn, user=Depends(get_current_user)):
    await require_role(user, "student")
    teacher = await db.teacher_profiles.find_one({"id": body.teacher_id})
    if not teacher:
        raise HTTPException(404, "Teacher not found")
    doc = {
        "id": str(uuid.uuid4()),
        "student_user_id": user["id"],
        "student_name": user["name"],
        "student_phone": user["phone"],
        "teacher_user_id": teacher["user_id"],
        "teacher_profile_id": teacher["id"],
        "teacher_name": teacher["name"],
        "subject": body.subject,
        "class_std": body.class_std,
        "preferred_area": body.preferred_area,
        "preferred_time": body.preferred_time,
        "budget": body.budget,
        "message": body.message,
        "status": "pending",
        "created_at": now_iso(),
    }
    await db.tuition_requests.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.get("/requests/sent")
async def sent_requests(user=Depends(get_current_user)):
    await require_role(user, "student")
    docs = await db.tuition_requests.find({"student_user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    # attach teacher phone when accepted
    for d in docs:
        if d["status"] == "accepted":
            t = await db.teacher_profiles.find_one({"id": d["teacher_profile_id"]}, {"_id": 0, "phone": 1})
            if t:
                d["teacher_phone"] = t.get("phone")
    return docs


@api.get("/requests/received")
async def received_requests(user=Depends(get_current_user)):
    await require_role(user, "teacher")
    docs = await db.tuition_requests.find({"teacher_user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    # hide student phone unless accepted
    for d in docs:
        if d["status"] != "accepted":
            d.pop("student_phone", None)
    return docs


@api.patch("/requests/{req_id}/status")
async def update_request_status(req_id: str, body: RequestStatusIn, user=Depends(get_current_user)):
    await require_role(user, "teacher")
    req = await db.tuition_requests.find_one({"id": req_id})
    if not req:
        raise HTTPException(404, "Request not found")
    if req["teacher_user_id"] != user["id"]:
        raise HTTPException(403, "Not your request")
    await db.tuition_requests.update_one({"id": req_id}, {"$set": {"status": body.status, "responded_at": now_iso()}})
    return {"ok": True, "status": body.status}


# ============= Saved / Favourites =============
@api.get("/saved")
async def list_saved(user=Depends(get_current_user)):
    await require_role(user, "student")
    saves = await db.saved_tutors.find({"user_id": user["id"]}, {"_id": 0}).to_list(200)
    ids = [s["teacher_profile_id"] for s in saves]
    tutors = await db.teacher_profiles.find({"id": {"$in": ids}}, {"_id": 0, "phone": 0, "email": 0}).to_list(200)
    return tutors


@api.post("/saved/{teacher_profile_id}")
async def save_tutor(teacher_profile_id: str, user=Depends(get_current_user)):
    await require_role(user, "student")
    exists = await db.saved_tutors.find_one({"user_id": user["id"], "teacher_profile_id": teacher_profile_id})
    if not exists:
        await db.saved_tutors.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "teacher_profile_id": teacher_profile_id,
            "created_at": now_iso(),
        })
    return {"ok": True}


@api.delete("/saved/{teacher_profile_id}")
async def unsave_tutor(teacher_profile_id: str, user=Depends(get_current_user)):
    await require_role(user, "student")
    await db.saved_tutors.delete_one({"user_id": user["id"], "teacher_profile_id": teacher_profile_id})
    return {"ok": True}


# ============= Reports =============
@api.post("/reports")
async def create_report(body: ReportIn, user=Depends(get_current_user)):
    await db.reports.insert_one({
        "id": str(uuid.uuid4()),
        "reporter_user_id": user["id"],
        "target_user_id": body.target_user_id,
        "reason": body.reason,
        "resolved": False,
        "created_at": now_iso(),
    })
    return {"ok": True}


# ============= Admin =============
@api.get("/admin/stats")
async def admin_stats(user=Depends(get_current_user)):
    await require_role(user, "admin")
    return {
        "total_users": await db.users.count_documents({}),
        "students": await db.users.count_documents({"role": "student"}),
        "teachers": await db.users.count_documents({"role": "teacher"}),
        "verified_teachers": await db.teacher_profiles.count_documents({"is_verified": True}),
        "unverified_teachers": await db.teacher_profiles.count_documents({"is_verified": False}),
        "total_requests": await db.tuition_requests.count_documents({}),
        "pending_reports": await db.reports.count_documents({"resolved": False}),
    }


@api.get("/admin/teachers")
async def admin_list_teachers(user=Depends(get_current_user)):
    await require_role(user, "admin")
    return await db.teacher_profiles.find({}, {"_id": 0}).to_list(500)


@api.get("/admin/users")
async def admin_list_users(user=Depends(get_current_user)):
    await require_role(user, "admin")
    return await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(500)


@api.patch("/admin/teachers/{teacher_id}/verify")
async def admin_verify(teacher_id: str, verified: bool = True, user=Depends(get_current_user)):
    await require_role(user, "admin")
    await db.teacher_profiles.update_one({"id": teacher_id}, {"$set": {"is_verified": verified}})
    return {"ok": True}


@api.delete("/admin/teachers/{teacher_id}")
async def admin_delete_teacher(teacher_id: str, user=Depends(get_current_user)):
    await require_role(user, "admin")
    prof = await db.teacher_profiles.find_one({"id": teacher_id})
    if prof:
        await db.teacher_profiles.delete_one({"id": teacher_id})
    return {"ok": True}


@api.patch("/admin/users/{user_id}/block")
async def admin_block(user_id: str, blocked: bool = True, user=Depends(get_current_user)):
    await require_role(user, "admin")
    await db.users.update_one({"id": user_id}, {"$set": {"is_blocked": blocked}})
    return {"ok": True}


@api.get("/admin/reports")
async def admin_reports(user=Depends(get_current_user)):
    await require_role(user, "admin")
    return await db.reports.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


# ============= Seed default admin =============
@app.on_event("startup")
async def seed_admin():
    admin_email = "admin@dibrugarhtuition.in"
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password("Admin@123"),
            "name": "Platform Admin",
            "phone": "+91-0000000000",
            "role": "admin",
            "is_blocked": False,
            "created_at": now_iso(),
        })


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

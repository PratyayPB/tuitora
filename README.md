# Tuitora — Dibrugarh Tuition Finder

Tuitora is a full-stack hyper-local platform designed to connect students and parents with qualified home tutors across Dibrugarh, Assam.

---

## 🛠 Tech Stack
- **Backend:** FastAPI, Motor (Async MongoDB), Pydantic v2, JWT Auth, Bcrypt, Uvicorn
- **Frontend:** React 18, Tailwind CSS, Lucide Icons, Sonner Toasts, React Router v6, TanStack React Query
- **Database:** MongoDB

---

## 📁 Project Structure

```
tution-app/
├── .env                       # Root environment variables
├── design_guidelines.json     # Brand design specifications
├── memory/
│   └── test_credentials.md   # Default test login accounts
├── backend/
│   ├── .env                   # Backend environment configuration
│   ├── requirements.txt       # Python dependencies
│   ├── server.py              # FastAPI server & endpoints
│   └── seed.py                # Database seed script for tutors
└── frontend/
    ├── .env                   # Frontend environment configuration
    ├── package.json           # Node dependencies
    ├── tailwind.config.js     # Tailwind styling setup
    ├── public/
    │   └── index.html
    └── src/
        ├── index.css
        ├── index.js
        ├── App.js
        ├── App.css
        ├── lib/
        │   ├── api.js
        │   ├── auth.jsx
        │   ├── constants.js
        │   └── utils.js
        ├── components/
        │   ├── Navbar.jsx
        │   ├── TutorCard.jsx
        │   └── ui/
        └── pages/
            ├── Home.jsx
            ├── TutorSearch.jsx
            ├── TutorDetail.jsx
            ├── Login.jsx
            ├── Signup.jsx
            ├── StudentDashboard.jsx
            ├── TeacherDashboard.jsx
            └── AdminDashboard.jsx
```

---

## 🚀 Getting Started

### 1. Environment Variables Setup
The `.env` files contain dummy values. Update them as needed:
- Root `.env`
- `backend/.env`
- `frontend/.env`

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

### 3. Seed Sample Data (Optional)
With backend running and MongoDB active:
```bash
cd backend
python seed.py
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend will be available at `http://localhost:3000`.

---

## 🔑 Default Credentials

- **Admin:** `admin@dibrugarhtuition.in` / `Admin@123`
- **Parent / Student Demo:** `parent@example.com` / `Parent@123`
- **Tutor Demo:** `ritu.das@example.com` / `Teacher@123`

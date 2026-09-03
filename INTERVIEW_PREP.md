# LOST & FOUND BOARD — INTERVIEW PREP CHEATSHEET

---

## 1. TECH STACK

### Backend (Django REST Framework)
- Django 5.1 — Python web framework (routing, ORM, views)
- Django REST Framework — turns Django into REST API (APIView, serializers, Response)
- SQLite — file-based database (say: "For production I'd switch to PostgreSQL — one line change in settings.py")
- PyJWT — creates and verifies JSON Web Tokens for auth
- Pillow — handles image upload processing
- django-cors-headers — allows React (port 3000) to talk to Django (port 8000)

### Frontend (React)
- Vite — build tool (faster than CRA, uses ES modules natively)
- React 18 — functional components + Hooks (useState, useEffect, useContext)
- React Router v6 — client-side routing (BrowserRouter, Routes, Route)
- Axios — HTTP client with interceptors (auto-injects JWT token)
- Tailwind CSS — utility-first CSS (responsive, no custom CSS files)

---

## 2. DATABASE MODELS (3 tables)

### User
- id (PK), name, email (unique), password_hash (bcrypt), phone, role (finder/owner)

### Item
- id (PK), title, description, photo (ImageField), category (Electronics/Documents/Accessories/Books/Keys/Clothing/Other), location, date_found, date_posted (auto_now_add), status (lost/found/claimed/resolved), posted_by (FK→User), verification_details (JSONField — stores Q&A pairs)

### Claim
- id (PK), item_id (FK→Item), owner_id (FK→User), verification_answers (JSONField), status (pending/approved/rejected), created_at (auto_now_add)

---

## 3. API ENDPOINTS

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register/ | No | Register → returns JWT |
| POST | /api/auth/login/ | No | Login → returns JWT |
| GET | /api/auth/me/ | Yes | Current user profile |
| GET | /api/items/ | No | List items (?category=&location=&type=&search=) |
| POST | /api/items/ | Yes | Create item (multipart: text + image) |
| GET | /api/items/{id}/ | No | Single item details |
| DELETE | /api/items/{id}/ | Yes | Delete own item |
| GET | /api/claims/questions/{item_id}/ | Yes | Get verification questions |
| POST | /api/claims/verify/ | Yes | Submit answers → approved/rejected |
| GET | /api/claims/my/ | Yes | User's claim history |
| GET | /api/health/ | No | Health check |

---

## 4. AUTHENTICATION FLOW (JWT)

1. User logs in → server validates credentials
2. Server creates JWT: {"user_id": 1, "exp": timestamp}
3. Token signed with SECRET_KEY using HS256 algorithm
4. Frontend stores token in localStorage
5. Axios interceptor adds "Authorization: Bearer <token>" to every request
6. Server decodes token, extracts user_id, fetches user from DB
7. If token expired → 401 Unauthorized → frontend redirects to login

### Key code (authentication.py):
```python
class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None
        token = auth_header.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user = User.objects.get(id=payload["user_id"])
            return (user, token)
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            raise AuthenticationFailed("Invalid or expired token")
```

---

## 5. VERIFICATION SYSTEM (YOUR UNIQUE FEATURE)

### Step 1 — Poster sets questions:
When posting a "Found" item, poster can check "Add verification questions" and fill Q&A pairs (e.g. "What color?" → "Blue", "What brand?" → "Nike"). Stored as JSON in Item.verification_details.

### Step 2 — Claimer answers:
Claimant clicks "Claim This Item" → frontend fetches GET /api/claims/questions/{id} (returns questions only, no answers) → user fills form → submits to POST /api/claims/verify.

### Step 3 — Backend evaluates:
Answers compared against stored details (case-insensitive). If ≥50% match → auto-approved, item status → "claimed". Otherwise → rejected.

### Fallback:
If poster didn't set custom questions, backend auto-generates by category (e.g. Electronics → "What brand?", "What color?", "What model?"). Answers checked against item description/location via substring matching.

```python
def _evaluate_answers(item, answers):
    if item.verification_details:
        correct = sum(
            1 for k, v in item.verification_details.items()
            if answers.get(k, "").strip().lower() == v.strip().lower()
        )
        threshold = max(1, len(item.verification_details) // 2)
        return correct >= threshold, f"{correct}/{len(item.verification_details)} correct"
    # else: auto-generated questions fallback
    ...
```

### Why it's better than other Lost & Found apps:
"Most apps let anyone claim and the finder manually verifies. Our system automates this so finders don't need to interrogate every claimant. The auto-generated fallback means verification works even if the poster skips custom questions."

---

## 6. LIKELY INTERVIEW QUESTIONS

### Django Questions

Q: "Why Django REST Framework over FastAPI?"
A: "Django has a mature ORM, built-in admin, and excellent ecosystem. DRF is battle-tested for REST APIs. FastAPI is faster for simple APIs but Django shines when you need models, relationships, and migrations."

Q: "How does Django's request/response cycle work?"
A: "Request comes in → URL resolver matches path → calls view → view processes request (validates data, queries DB) → returns Response → Django serializes to JSON → sends back to client."

Q: "What's the difference between APIView and ViewSet?"
A: "I used APIView for explicit control over each HTTP method. ViewSet auto-generates CRUD routes but APIView is clearer for custom logic like the verification system."

Q: "How do serializers work?"
A: "Serializers convert Django model instances to JSON and JSON input to Python objects. They also validate data — checking email uniqueness, valid categories, etc. ModelSerializer auto-generates fields from the model."

Q: "How did you handle file uploads?"
A: "MultiPartParser + FormParser parsers. Validate extension (jpg/png/gif/webp), rename with UUID to prevent collisions, Django's ImageField handles storage. URL auto-generated via .url property."

Q: "What are TextChoices?"
A: "Django's enum class for model fields. Restricts field to valid values at Python and database level. Prevents invalid data like status='stolen'."

### React Questions

Q: "How does useState work?"
A: "Returns a state variable and a setter function. When setter is called with new value, component re-renders. Used for form inputs, loading states, error messages."

Q: "How does useEffect work?"
A: "Runs side effects after render. useEffect(() => fetchData(), []) with empty dependency array = runs once on mount. Used for API calls."

Q: "What is Context API?"
A: "AuthContext provides user state globally without prop drilling. AuthProvider wraps entire app, any component accesses user via useAuth()."

Q: "How does the Axios interceptor work?"
A: "Request interceptor runs before every API call. Reads JWT from localStorage, attaches Authorization header. Components don't need to handle tokens individually."

Q: "How does React Router work?"
A: "BrowserRouter listens to URL changes. Routes map paths to components. ProtectedRoute checks auth context → redirects to /login if not authenticated."

Q: "Why Tailwind CSS?"
A: "Utility-first — compose styles with classes like rounded-2xl, p-6. Faster development, responsive by default, unused styles purged during build."

---

## 7. COMMON FOLLOW-UP QUESTIONS

Q: "How would you handle pagination?"
A: "Already implemented — skip and limit query params on GET /api/items. Frontend could add 'Load More' or page numbers."

Q: "How would you add search?"
A: "Already implemented — search param uses SQL ilike on title and description fields."

Q: "How would you deploy this?"
A: "Backend on Render/Railway with gunicorn + uvicorn. Frontend on Vercel/Netlify with environment variable for API URL. SQLite→PostgreSQL for production."

Q: "What's a security concern?"
A: "localStorage JWT is vulnerable to XSS. In production, store token in httpOnly cookie instead. Also add rate limiting on auth endpoints."

Q: "What if two people claim the same item?"
A: "Backend checks for existing non-rejected claims before creating a new one. Prevents duplicate claims."

Q: "How would you add real-time notifications?"
A: "Django Channels for WebSockets. When claim is approved, push notification to the finder."

---

## 8. YOUR 30-SECOND PROJECT PITCH

"This is a Lost & Found Board built with Django REST Framework and React. Users can post lost or found items with photos, search and filter through listings, and claim items they believe are theirs. The key feature is an automated verification system — when posting, users can set Q&A pairs about the item. Claimants answer these questions and the backend auto-approves or rejects based on accuracy. If no custom questions are set, the system generates them based on the item category and checks against the description. Authentication is handled via JWT tokens, and the frontend and backend are completely decoupled."

---

## 9. QUESTIONS TO ASK THE INTERVIEWER

1. "What does your current tech stack look like — do you use Django or FastAPI?"
2. "How does your team handle code reviews and PRs?"
3. "What would a typical first project look like for a new developer here?"
4. "What's the biggest technical challenge your team is facing right now?"

---

## 10. KEY FILES TO REFERENCE

| File | What It Proves |
|------|---------------|
| backend/api/models.py | Django ORM, relationships, TextChoices enums |
| backend/api/authentication.py | Custom JWT auth, token decode logic |
| backend/api/views.py | APIView patterns, verification business logic |
| backend/api/serializers.py | ModelSerializer + custom validation |
| frontend/src/context/AuthContext.jsx | Context API, token management |
| frontend/src/components/VerificationModal.jsx | Multi-step modal, API integration |
| frontend/src/pages/Dashboard.jsx | Complex component: filters, API, loading states |

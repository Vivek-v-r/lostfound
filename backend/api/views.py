import uuid
import jwt
from datetime import datetime, timedelta, timezone
from django.conf import settings
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .models import User, Item, Claim, Category, ItemStatus, ClaimStatus
from .serializers import (
    UserRegisterSerializer,
    UserLoginSerializer,
    UserOutSerializer,
    ItemOutSerializer,
    ClaimOutSerializer,
)
from .authentication import JWTAuthentication


def _create_token(user):
    payload = {
        "user_id": user.id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        "iat": datetime.now(timezone.utc),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return token


def _token_response(user):
    token = _create_token(user)
    return Response({
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
    })


# ─── Auth ────────────────────────────────────────────


class RegisterView(APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return _token_response(user)


class LoginView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not user.check_password(password):
            return Response(
                {"detail": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return _token_response(user)


class MeView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        serializer = UserOutSerializer(request.user)
        return Response(serializer.data)


# ─── Items ───────────────────────────────────────────


class ItemListCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        queryset = Item.objects.select_related("posted_by").all()

        category = request.query_params.get("category")
        if category:
            if category not in [c.value for c in Category]:
                return Response(
                    {"detail": f"Invalid category: {category}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            queryset = queryset.filter(category=category)

        location = request.query_params.get("location")
        if location:
            queryset = queryset.filter(location__icontains=location)

        item_type = request.query_params.get("type")
        if item_type:
            if item_type not in ["lost", "found"]:
                return Response(
                    {"detail": "type must be 'lost' or 'found'"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            queryset = queryset.filter(status=item_type)

        search = request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        queryset = queryset.order_by("-date_posted")
        total = queryset.count()

        page = int(request.query_params.get("skip", 0))
        limit = int(request.query_params.get("limit", 20))
        items = queryset[page : page + limit]

        serializer = ItemOutSerializer(items, many=True, context={"request": request})
        return Response({"items": serializer.data, "total": total})

    def post(self, request):
        auth = JWTAuthentication()
        result = auth.authenticate(request)
        if result is None:
            return Response(
                {"detail": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        user, _ = result

        title = request.data.get("title")
        if not title:
            return Response(
                {"detail": "title is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        category = request.data.get("category")
        if category not in [c.value for c in Category]:
            return Response(
                {"detail": f"Invalid category: {category}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        item_status = request.data.get("status", "lost")
        if item_status not in [s.value for s in ItemStatus]:
            return Response(
                {"detail": f"Invalid status: {item_status}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        photo = request.FILES.get("photo")
        photo_field = None
        if photo:
            ext = photo.name.rsplit(".", 1)[-1].lower() if "." in photo.name else ""
            allowed = {"jpg", "jpeg", "png", "gif", "webp"}
            if ext not in allowed:
                return Response(
                    {"detail": "Unsupported file type"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            photo.name = f"{uuid.uuid4().hex}.{ext}"
            photo_field = photo

        date_found = request.data.get("date_found")
        parsed_date = None
        if date_found:
            try:
                parsed_date = datetime.fromisoformat(date_found)
            except ValueError:
                return Response(
                    {"detail": "Invalid date_found format (use ISO 8601)"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        verification_details = request.data.get("verification_details")
        parsed_vd = None
        if verification_details:
            import json
            try:
                parsed_vd = json.loads(verification_details)
            except json.JSONDecodeError:
                return Response(
                    {"detail": "verification_details must be valid JSON"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        item = Item.objects.create(
            title=title,
            description=request.data.get("description"),
            photo=photo_field,
            category=category,
            location=request.data.get("location"),
            date_found=parsed_date,
            status=item_status,
            posted_by=user,
            verification_details=parsed_vd,
        )

        serializer = ItemOutSerializer(item, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ItemDetailView(APIView):
    def get_object(self, pk):
        try:
            return Item.objects.select_related("posted_by").get(pk=pk)
        except Item.DoesNotExist:
            return None

    def get(self, request, pk):
        item = self.get_object(pk)
        if not item:
            return Response(
                {"detail": "Item not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = ItemOutSerializer(item, context={"request": request})
        return Response(serializer.data)

    def delete(self, request, pk):
        auth = JWTAuthentication()
        result = auth.authenticate(request)
        if result is None:
            return Response(
                {"detail": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        user, _ = result

        item = self.get_object(pk)
        if not item:
            return Response(
                {"detail": "Item not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        if item.posted_by.id != user.id:
            return Response(
                {"detail": "Not your item"},
                status=status.HTTP_403_FORBIDDEN,
            )
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Claims ──────────────────────────────────────────


def _default_questions(category):
    questions_map = {
        Category.ELECTRONICS: [
            {"id": "brand", "question": "What brand is the item?"},
            {"id": "color", "question": "What color is the item?"},
            {"id": "model", "question": "What model or serial number does it have?"},
        ],
        Category.DOCUMENTS: [
            {"id": "name_on_doc", "question": "What name appears on the document?"},
            {"id": "doc_type", "question": "What type of document is it?"},
            {"id": "issuing_authority", "question": "What issuing authority or institution is mentioned?"},
        ],
        Category.ACCESSORIES: [
            {"id": "color", "question": "What color is the accessory?"},
            {"id": "brand", "question": "What brand is it?"},
            {"id": "material", "question": "What material is it made of?"},
        ],
        Category.BOOKS: [
            {"id": "title", "question": "What is the title of the book?"},
            {"id": "author", "question": "Who is the author?"},
            {"id": "isbn", "question": "What is the ISBN number (if visible)?"},
        ],
        Category.KEYS: [
            {"id": "key_count", "question": "How many keys are on the keyring?"},
            {"id": "keychain_color", "question": "What color is the keychain or fob?"},
            {"id": "key_type", "question": "What type of keys are they (e.g. house, car, padlock)?"},
        ],
        Category.CLOTHING: [
            {"id": "size", "question": "What size is the item?"},
            {"id": "color", "question": "What color is the item?"},
            {"id": "brand", "question": "What brand is it?"},
        ],
        Category.OTHER: [
            {"id": "detailed_desc", "question": "Describe the item in detail."},
            {"id": "condition", "question": "What condition is the item in?"},
            {"id": "distinguishing_feature", "question": "What is a distinguishing feature of the item?"},
        ],
    }
    return questions_map.get(category, questions_map[Category.OTHER])


def _evaluate_answers(item, answers):
    if item.verification_details:
        expected = item.verification_details
        total = len(expected)
        if total == 0:
            return True, "No verification required."
        correct = 0
        for key, expected_answer in expected.items():
            user_answer = answers.get(key, "").strip().lower()
            if user_answer == expected_answer.strip().lower():
                correct += 1
        threshold = max(1, total // 2)
        if correct >= threshold:
            return True, f"Verification passed ({correct}/{total} answers correct)."
        return False, f"Verification failed ({correct}/{total} answers correct)."

    defaults = _default_questions(item.category)
    total = len(defaults)
    correct = 0
    for q in defaults:
        user_answer = answers.get(q["id"], "").strip().lower()
        if not user_answer:
            continue
        desc = (item.description or "").lower()
        loc = (item.location or "").lower()
        if user_answer in desc or user_answer in loc:
            correct += 1
    threshold = max(1, total // 2)
    if correct >= threshold:
        return True, f"Verification passed ({correct}/{total} plausible answers)."
    return False, f"Verification failed ({correct}/{total} plausible answers)."


class ClaimQuestionsView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request, item_id):
        try:
            item = Item.objects.get(pk=item_id)
        except Item.DoesNotExist:
            return Response(
                {"detail": "Item not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if item.verification_details:
            questions = [
                {"id": k, "question": v}
                for k, v in item.verification_details.items()
            ]
        else:
            questions = _default_questions(item.category)

        return Response(questions)


class ClaimVerifyView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        user = request.user
        item_id = request.data.get("item_id")
        answers = request.data.get("answers", {})

        if not item_id:
            return Response(
                {"detail": "item_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            item = Item.objects.get(pk=item_id)
        except Item.DoesNotExist:
            return Response(
                {"detail": "Item not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if user.id == item.posted_by.id:
            return Response(
                {"detail": "You cannot claim your own item"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing = Claim.objects.filter(
            item=item, owner=user
        ).exclude(status=ClaimStatus.REJECTED).first()
        if existing:
            return Response(
                {"detail": "You already have a pending or approved claim on this item"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        passed, message = _evaluate_answers(item, answers)
        claim_status = ClaimStatus.APPROVED if passed else ClaimStatus.REJECTED

        claim = Claim.objects.create(
            item=item,
            owner=user,
            verification_answers=answers,
            status=claim_status,
        )

        if passed:
            item.status = ItemStatus.CLAIMED
            item.save()

        return Response({
            "claim_id": claim.id,
            "status": claim.status,
            "message": message,
        })


class MyClaimsView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        claims = Claim.objects.filter(owner=request.user).select_related("item").order_by("-created_at")
        serializer = ClaimOutSerializer(claims, many=True)
        return Response(serializer.data)


class HealthView(APIView):
    def get(self, request):
        return Response({"status": "ok"})

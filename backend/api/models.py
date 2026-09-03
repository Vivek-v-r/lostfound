from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class UserRole(models.TextChoices):
    FINDER = "finder", "Finder"
    OWNER = "owner", "Owner"


class ItemStatus(models.TextChoices):
    LOST = "lost", "Lost"
    FOUND = "found", "Found"
    CLAIMED = "claimed", "Claimed"
    RESOLVED = "resolved", "Resolved"


class ClaimStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    APPROVED = "approved", "Approved"
    REJECTED = "rejected", "Rejected"


class Category(models.TextChoices):
    ELECTRONICS = "Electronics", "Electronics"
    DOCUMENTS = "Documents", "Documents"
    ACCESSORIES = "Accessories", "Accessories"
    BOOKS = "Books", "Books"
    KEYS = "Keys", "Keys"
    CLOTHING = "Clothing", "Clothing"
    OTHER = "Other", "Other"


class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=10, choices=UserRole.choices, default=UserRole.FINDER)

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password_hash)


class Item(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    photo = models.ImageField(upload_to="uploads/", blank=True, null=True)
    category = models.CharField(max_length=20, choices=Category.choices)
    location = models.CharField(max_length=255, blank=True, null=True)
    date_found = models.DateTimeField(blank=True, null=True)
    date_posted = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=ItemStatus.choices, default=ItemStatus.LOST)
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="items")
    verification_details = models.JSONField(blank=True, null=True)


class Claim(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="claims")
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="claims")
    verification_answers = models.JSONField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=ClaimStatus.choices, default=ClaimStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

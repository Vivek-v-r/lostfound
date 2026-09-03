from rest_framework import serializers
from .models import User, Item, Claim, UserRole


class UserRegisterSerializer(serializers.Serializer):
    name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    role = serializers.ChoiceField(choices=UserRole.choices, default=UserRole.FINDER)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class UserOutSerializer(serializers.ModelSerializer):
    role = serializers.CharField()

    class Meta:
        model = User
        fields = ["id", "name", "email", "phone", "role"]


class ItemOutSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    category = serializers.CharField()
    status = serializers.CharField()
    poster_name = serializers.CharField(source="posted_by.name", read_only=True)

    class Meta:
        model = Item
        fields = [
            "id", "title", "description", "photo_url", "category",
            "location", "date_found", "date_posted", "status",
            "posted_by", "poster_name",
        ]

    def get_photo_url(self, obj):
        if obj.photo:
            url = obj.photo.url
            if url.startswith("/"):
                request = self.context.get("request")
                if request:
                    return request.build_absolute_uri(url)
                return url
            return url
        return None


class ClaimOutSerializer(serializers.ModelSerializer):
    status = serializers.CharField()
    item_title = serializers.CharField(source="item.title", read_only=True)

    class Meta:
        model = Claim
        fields = ["id", "item_id", "owner_id", "verification_answers", "status", "created_at", "item_title"]

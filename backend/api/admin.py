from django.contrib import admin
from .models import User, Item, Claim

admin.site.register(User)
admin.site.register(Item)
admin.site.register(Claim)

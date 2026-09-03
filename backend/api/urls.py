from django.urls import path
from . import views

urlpatterns = [
    path("auth/register/", views.RegisterView.as_view()),
    path("auth/login/", views.LoginView.as_view()),
    path("auth/me/", views.MeView.as_view()),
    path("items/", views.ItemListCreateView.as_view()),
    path("items/<int:pk>/", views.ItemDetailView.as_view()),
    path("claims/questions/<int:item_id>/", views.ClaimQuestionsView.as_view()),
    path("claims/verify/", views.ClaimVerifyView.as_view()),
    path("claims/my/", views.MyClaimsView.as_view()),
    path("health/", views.HealthView.as_view()),
]

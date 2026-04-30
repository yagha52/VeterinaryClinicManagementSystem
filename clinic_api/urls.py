from django.urls import path
from . import views

urlpatterns = [
    path('appointments/', views.appointment_list, name='appointment-list'),
    path('auth/login/', views.vet_login, name='vet-login'),
    path('petowners/', views.petowners_list, name='petowners-list'),
    path('petowners/<int:pk>/', views.petowner_detail, name='petowner-detail'),
]


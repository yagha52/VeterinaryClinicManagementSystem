from django.urls import path
from . import views

urlpatterns = [
    path('appointments/', views.appointment_list, name='appointment-list'),
    path('appointments/<int:pk>/', views.appointment_detail, name='appointment-detail'),
    path('auth/login/', views.vet_login, name='vet-login'),
    path('petowners/', views.petowners_list, name='petowners-list'),
    path('petowners/<int:pk>/', views.petowner_detail, name='petowner-detail'),
    path('pet-records/', views.pet_list, name='pet-list'),
    path('pet-records/<int:pk>/', views.pet_detail, name='pet-detail'),
]


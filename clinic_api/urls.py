from django.urls import path
from . import views

urlpatterns = [
    path('appointments/', views.appointment_list, name='appointment-list'),
    path('auth/login/', views.vet_login, name='vet-login'),
]

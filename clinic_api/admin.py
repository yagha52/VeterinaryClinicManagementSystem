from django.contrib import admin
from .models import PetOwner, Veterinarian, PetRecord, MedicalAppointment
# Register your models here.

admin.site.register(PetOwner)
admin.site.register(Veterinarian)
admin.site.register(PetRecord)
admin.site.register(MedicalAppointment)
from django.db import models
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError

# Create your models here.
class PetOwner(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    contact_email = models.EmailField()
    phone = models.CharField(max_length=8)
    owner_photo = models.ImageField(upload_to='owner_photos/')

    def __str__(self):
        return self.name
    
class PetRecord(models.Model):
    id = models.AutoField(primary_key=True)
    owner = models.ForeignKey(PetOwner, on_delete=models.CASCADE)
    pet_name = models.CharField(max_length=100)
    species = models.CharField(max_length=100)
    birth_date = models.DateField()
    breed = models.CharField(max_length=100)
    gender = models.CharField(max_length=10, choices=[('Male', 'M'), ('Female', 'F')])
    color = models.CharField(max_length=10)
    weight = models.FloatField()
    allergies = models.TextField(blank=True)
    vaccinations_notes = models.TextField(blank=True)
    medical_history = models.FileField(upload_to='medical_histories/')

    def __str__(self):
        return self.pet_name

class Veterinarian(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    password = models.CharField(max_length=100)
    specialty = models.CharField(max_length=100)
    phone = models.CharField(max_length=8)
    hire_date = models.DateField()

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.password.startswith('pbkdf2_'):
            if len(self.password) < 7:
                raise ValidationError("Password must be at least 7 characters long.")
            self.password = make_password(self.password)
        super().save(*args, **kwargs)
    

class MedicalAppointment(models.Model):
    id = models.AutoField(primary_key=True)
    pet = models.ForeignKey(PetRecord, on_delete=models.CASCADE)
    veterinarian = models.ForeignKey(Veterinarian, on_delete=models.CASCADE)
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    diagnosis_notes = models.TextField(blank=True, default='')
    reason = models.TextField(blank=True, default='')
    treatment_plan = models.TextField(blank=True, default='')
    status = models.CharField(max_length=10, choices=[('Scheduled', 'S'), ('Completed', 'C'), ('Cancelled', 'X')])
from rest_framework import serializers
from .models import PetOwner, Veterinarian, PetRecord, MedicalAppointment

class PetOwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PetOwner
        fields = '__all__'

class VeterinarianSerializer(serializers.ModelSerializer):
    class Meta:
        model = Veterinarian
        fields = '__all__'

class PetRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PetRecord
        fields = '__all__'

class MedicalAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalAppointment
        fields = '__all__'

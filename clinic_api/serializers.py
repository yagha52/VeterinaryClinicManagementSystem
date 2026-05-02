from rest_framework import serializers
from .models import PetOwner, Veterinarian, PetRecord, MedicalAppointment, MedicalRecordEntry

class PetOwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PetOwner
        fields = '__all__'

class PetOwnerShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = PetOwner
        fields = ['id', 'name', 'phone', 'contact_email']

class VeterinarianSerializer(serializers.ModelSerializer):
    class Meta:
        model = Veterinarian
        fields = '__all__'

class MedicalRecordEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalRecordEntry
        fields = '__all__'

class PetRecordSerializer(serializers.ModelSerializer):
    medical_entries = MedicalRecordEntrySerializer(many=True, read_only=True)
    class Meta:
        model = PetRecord
        fields = '__all__'

class MedicalAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalAppointment
        fields = '__all__'

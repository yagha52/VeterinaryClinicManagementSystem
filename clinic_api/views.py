from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.parsers import JSONParser
from .models import MedicalAppointment, Veterinarian
from .serializers import MedicalAppointmentSerializer
from django.contrib.auth.hashers import check_password
from django.db.models import Q

@api_view(['GET', 'POST'])
def appointment_list(request):
    if request.method == 'GET':
        # 1. Fetch all appointments
        appointments = MedicalAppointment.objects.all()
        
        search_query = request.GET.get('search', None)
        if search_query:
            appointments = appointments.filter(
                Q(reason__icontains=search_query) | 
                Q(diagnosis_notes__icontains=search_query)
            )

        # 2. Serialize and return as JSON
        serializer = MedicalAppointmentSerializer(appointments, many=True)
        return JsonResponse(serializer.data, safe=False)

    elif request.method == 'POST':
        # 3. Handle saving a new appointment from Angular
        serializer = MedicalAppointmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)

@api_view(['POST'])
def vet_login(request):
    # 1. Read the data sent from Angular
    data = JSONParser().parse(request)
    email = data.get('email')
    password = data.get('password')
    
    try:
        # 2. Look for a matching Vet in the database
        vet = Veterinarian.objects.get(email=email)
        
        # 3. Check if the password matches the stored hash
        if check_password(password, vet.password):
            # 4. If found, return success and their ID so Angular knows who is logged in!
            return JsonResponse({
                "message": "Login successful", 
                "vet_id": vet.id,
                "vet_name": vet.name
            }, status=200)
        else:
            return JsonResponse({"error": "Invalid email or password"}, status=400)
        
    except Veterinarian.DoesNotExist:
        # 4. If the email/password doesn't match, return an error
        return JsonResponse({"error": "Invalid email or password"}, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
def appointment_detail(request, pk):
    try:
        appointment = MedicalAppointment.objects.get(pk=pk)
    except MedicalAppointment.DoesNotExist:
        return JsonResponse({'error': 'Appointment not found'}, status=404)

    if request.method == 'GET':
        serializer = MedicalAppointmentSerializer(appointment)
        return JsonResponse(serializer.data)

    elif request.method == 'PUT':
        # Handle updating an existing appointment
        serializer = MedicalAppointmentSerializer(appointment, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data)
        return JsonResponse(serializer.errors, status=400)

    elif request.method == 'DELETE':
        appointment.delete()
        return JsonResponse({'message': 'Appointment deleted successfully'}, status=204)
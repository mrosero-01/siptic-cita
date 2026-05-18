import os
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.appointments.models import Appointment
from apps.doctors.models import Doctor, Specialty, DoctorSchedule
from apps.patients.models import Patient

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None

try:
    from groq import Groq
except ImportError:
    Groq = None

if load_dotenv:
    load_dotenv()


@api_view(['POST'])
def ai_assistant_chat(request):
    message = str(request.data.get('message', '')).strip()

    if not message:
        return Response({'error': 'Escribe una pregunta para el asistente.'}, status=400)

    api_key = os.environ.get('GROQ_API_KEY')

    if not api_key:
        return Response({'error': 'Falta configurar GROQ_API_KEY en el archivo .env del backend.'}, status=500)

    if Groq is None:
        return Response({'error': 'Falta instalar la librería groq en el entorno de Python.'}, status=500)

    context = build_clinic_context()
    system_prompt = f"""
Eres MediBot, el asistente interno de Siptic-Cita, un sistema de gestión de citas médicas.
Ayudas a administradores y recepcionistas a consultar información, resumir agenda, redactar mensajes y detectar problemas operativos.
Responde siempre en español, con tono profesional, claro y breve.
No inventes datos. Si la pregunta requiere información que no aparece en el contexto, dilo con claridad.
Si redactas mensajes para pacientes, entrégalos listos para copiar y pegar.

CONTEXTO ACTUAL DEL SISTEMA:
{context}
"""

    try:
        client = Groq(api_key=api_key)
        completion = client.chat.completions.create(
            model=os.environ.get('GROQ_MODEL', 'llama-3.1-8b-instant'),
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': message}
            ],
            temperature=0.4,
            max_tokens=600
        )
        answer = completion.choices[0].message.content
        return Response({'response': answer})
    except Exception as error:
        return Response({'error': str(error)}, status=500)


def build_clinic_context():
    today = timezone.localdate()
    total_doctors = Doctor.objects.count()
    total_patients = Patient.objects.count()
    total_specialties = Specialty.objects.count()
    total_appointments = Appointment.objects.count()
    today_appointments = Appointment.objects.filter(date=today).select_related('patient', 'doctor', 'specialty')

    status_counts = []
    for status, label in Appointment._meta.get_field('status').choices:
        count = Appointment.objects.filter(status=status).count()
        status_counts.append(f'{label}: {count}')

    doctors = Doctor.objects.select_related('specialty').order_by('first_name', 'last_name')[:15]
    doctors_context = [
        f'{doctor.full_name} ({doctor.specialty.name}, doc {doctor.n_document})'
        for doctor in doctors
    ]

    upcoming = Appointment.objects.select_related('patient', 'doctor', 'specialty').filter(date__gte=today).order_by('date', 'start_time')[:15]
    upcoming_context = [
        f'{appointment.date} {appointment.start_time}: {appointment.patient.full_name} con {appointment.doctor.full_name} ({appointment.specialty.name}) estado {appointment.status}'
        for appointment in upcoming
    ]

    schedules = DoctorSchedule.objects.select_related('doctor', 'doctor__specialty').filter(date__gte=today, status=True).order_by('date', 'start_time')[:15]
    schedules_context = [
        f'{schedule.date} {schedule.start_time}-{schedule.end_time}: {schedule.doctor.full_name} ({schedule.doctor.specialty.name})'
        for schedule in schedules
    ]

    today_context = [
        f'{appointment.start_time}: {appointment.patient.full_name} con {appointment.doctor.full_name} ({appointment.status})'
        for appointment in today_appointments.order_by('start_time')[:20]
    ]

    return '\n'.join([
        f'Fecha actual: {today}',
        f'Médicos registrados: {total_doctors}',
        f'Pacientes registrados: {total_patients}',
        f'Especialidades registradas: {total_specialties}',
        f'Citas totales: {total_appointments}',
        f'Citas por estado: {", ".join(status_counts)}',
        f'Médicos principales: {"; ".join(doctors_context) if doctors_context else "sin médicos registrados"}',
        f'Citas de hoy: {"; ".join(today_context) if today_context else "no hay citas para hoy"}',
        f'Próximas citas: {"; ".join(upcoming_context) if upcoming_context else "no hay próximas citas"}',
        f'Próximos horarios disponibles: {"; ".join(schedules_context) if schedules_context else "no hay horarios próximos"}'
    ])

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Interfaz basada en el serializer de django
export interface Appointment {
  id: number;
  patient: number;
  patient_name : string;  
  doctor: number;
  doctor_name : string;
  specialty: number; 
  specialty_name : string;  
  date: string;        
  start_time: string;  
  description: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED' | 'ATTENDED' | 'NO_SHOW' | string;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/appointments/'; 

  appointmentsSignal = signal<Appointment[]>([]);

  // Listar citas
  getAppointments(): void {
    this.http.get<Appointment[]>(this.apiUrl).subscribe({
      next: (data) => this.appointmentsSignal.set(data),
      error: (err) => console.error('Error de conexión:', err)
    });
  }

  // Crear cita nueva
  createAppointment(appointment: Partial<Appointment>): void {
    this.http.post<Appointment>(this.apiUrl, appointment).subscribe({
      next: (newAppointment) => {
        // Añade la nueva cita al array de forma reactiva de una vez
        this.appointmentsSignal.update(appointments => [...appointments, newAppointment]);
      },
      error: (err) => console.error('Error al guardar la cita en Django:', err)
    });
  }
}
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { showError, showSuccess } from './api-alert';

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

  getAppointments(): void {
    this.http.get<Appointment[]>(this.apiUrl).subscribe({
      next: (data) => this.appointmentsSignal.set(data),
      error: (err) => showError('No se pudieron cargar las citas.', err)
    });
  }

  createAppointment(appointment: Partial<Appointment>, onSuccess?: () => void): void {
    this.http.post<Appointment>(this.apiUrl, appointment).subscribe({
      next: (newAppointment) => {
        this.appointmentsSignal.update(appointments => [...appointments, newAppointment]);
        showSuccess('Cita creada correctamente.');
        onSuccess?.();
      },
      error: (err) => showError('No se pudo crear la cita.', err)
    });
  }

  deleteAppointment(id: number): void {
    this.http.delete(`${this.apiUrl}${id}/`).subscribe({
      next: () => {
        this.appointmentsSignal.update(appointments =>
          appointments.filter(appointment => appointment.id !== id)
        );
        showSuccess('Cita eliminada correctamente.');
      },
      error: (err) => showError('No se pudo eliminar la cita.', err)
    });
  }

  updateAppointment(id: number, appointmentData: Partial<Appointment>, onSuccess?: () => void): void {
    this.http.put<Appointment>(`${this.apiUrl}${id}/`, appointmentData).subscribe({
      next: (updatedAppointment) => {
        this.appointmentsSignal.update(appointments =>
          appointments.map(a => a.id === id ? updatedAppointment : a)
        );
        showSuccess('Cita actualizada correctamente.');
        onSuccess?.();
      },
      error: (err) => showError('No se pudo actualizar la cita.', err)
    });
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';


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
      error: (err) => console.error('Error de conexión:', err)
    });
  }

  
  createAppointment(appointment: Partial<Appointment>): void {
    this.http.post<Appointment>(this.apiUrl, appointment).subscribe({
      next: (newAppointment) => {
        
        this.appointmentsSignal.update(appointments => [...appointments, newAppointment]);
      },
      error: (err) => console.error('Error al guardar la cita en Django:', err)
    });
  }

  
  deleteAppointment(id: number): void {
    this.http.delete(`${this.apiUrl}${id}/`).subscribe({
      next: () => {
        this.appointmentsSignal.update(appointments =>
          appointments.filter(appointment => appointment.id !== id)
        );
        console.log(`Cita #${id} eliminada correctamente.`);
      },
      error: (err) => console.error('Error al eliminar la cita', err)
    });
  }

  
  updateAppointment(id: number, appointmentData: Partial<Appointment>): void {
    this.http.put<Appointment>(`${this.apiUrl}${id}/`, appointmentData).subscribe({
      next: (updatedAppointment) => {
        
        
        this.appointmentsSignal.update(appointments =>
          appointments.map(a => a.id === id ? updatedAppointment : a)
        );
        console.log(`Cita #${id} actualizada con éxito.`);
      },
      error: (err) => console.error('Error al actualizar la cita en Django:', err)
    });
  }
}
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { showError, showSuccess } from './api-alert';

export interface DoctorSchedule {
  id: number;
  doctor: number;
  doctor_name: string;
  specialty: number;
  specialty_name: string;
  date: string;
  day_of_week: number;
  day_name: string;
  formatted_date: string;
  start_time: string;
  end_time: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/schedules/';

  schedulesSignal = signal<DoctorSchedule[]>([]);

  getSchedules(): void {
    this.http.get<DoctorSchedule[]>(this.apiUrl).subscribe({
      next: (data) => this.schedulesSignal.set(data),
      error: (err) => showError('No se pudieron cargar los horarios.', err)
    });
  }

  createSchedule(schedule: Partial<DoctorSchedule>, onSuccess?: () => void): void {
    this.http.post<DoctorSchedule>(this.apiUrl, schedule).subscribe({
      next: (newSchedule) => {
        this.schedulesSignal.update(schedules => [...schedules, newSchedule]);
        showSuccess('Horario creado correctamente.');
        onSuccess?.();
      },
      error: (err) => showError('No se pudo crear el horario.', err)
    });
  }

  deleteSchedule(id: number): void {
    this.http.delete(`${this.apiUrl}${id}/`).subscribe({
      next: () => {
        this.schedulesSignal.update(schedules => schedules.filter(schedule => schedule.id !== id));
        showSuccess('Horario eliminado correctamente.');
      },
      error: (err) => showError('No se pudo eliminar el horario.', err)
    });
  }
}

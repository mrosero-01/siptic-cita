import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { showError, showSuccess } from './api-alert';

export interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  specialty: number;          
  specialty_name?: string;     
  n_document: string;
  phone: string;
  email: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/doctors/'; 

  public doctorsSignal = signal<Doctor[]>([]);

  getDoctors(): void {
    this.http.get<Doctor[]>(this.apiUrl).subscribe({
      next: (data) => this.doctorsSignal.set(data),
      error: (err) => showError('No se pudieron cargar los médicos.', err)
    });
  }

  createDoctor(doctor: Partial<Doctor>, onSuccess?: () => void): void {
    this.http.post<Doctor>(this.apiUrl, doctor).subscribe({
      next: (newDoctor) => {
        this.doctorsSignal.update(doctors => [...doctors, newDoctor]);
        showSuccess('Médico creado correctamente.');
        onSuccess?.();
      },
      error: (err) => showError('No se pudo crear el médico.', err)
    });
  }

  deleteDoctor(id: number): void {
    this.http.delete(`${this.apiUrl}${id}/`).subscribe({
      next: () => {
        this.doctorsSignal.update(doctors => 
          doctors.filter(doctor => doctor.id !== id)
        );
        showSuccess('Médico eliminado correctamente.');
      },
      error: (err) => showError('No se pudo eliminar el médico.', err)
    });
  }

  updateDoctor(id: number, doctorData: Partial<Doctor>, onSuccess?: () => void): void {
    this.http.put<Doctor>(`${this.apiUrl}${id}/`, doctorData).subscribe({
      next: (updatedDoctor) => {
        this.doctorsSignal.update(doctors =>
          doctors.map(d => d.id === id ? updatedDoctor : d)
        );
        showSuccess('Médico actualizado correctamente.');
        onSuccess?.();
      },
      error: (err) => showError('No se pudo actualizar el médico.', err)
    });
  }
}

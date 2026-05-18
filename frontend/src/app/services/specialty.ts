import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { showError, showSuccess } from './api-alert';

export interface Specialty {
  id: number;
  name: string;
  description: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SpecialtiesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/specialties/'; 

  specialtiesSignal = signal<Specialty[]>([]);

  getSpecialties(): void {
    this.http.get<Specialty[]>(this.apiUrl).subscribe({
      next: (data) => this.specialtiesSignal.set(data),
      error: (err) => showError('No se pudieron cargar las especialidades.', err)
    });
  }

  createSpecialty(specialty: Partial<Specialty>, onSuccess?: () => void): void {
    this.http.post<Specialty>(this.apiUrl, specialty).subscribe({
      next: (newSpecialty) => {
        this.specialtiesSignal.update(specialties => [...specialties, newSpecialty]);
        showSuccess('Especialidad creada correctamente.');
        onSuccess?.();
      },
      error: (err) => showError('No se pudo crear la especialidad.', err)
    });
  }

  deleteSpecialty(id: number): void {
    this.http.delete(`${this.apiUrl}${id}/`).subscribe({
      next: () => {
        this.specialtiesSignal.update(specialties =>
          specialties.filter(specialty => specialty.id !== id)
        );
        showSuccess('Especialidad eliminada correctamente.');
      },
      error: (err) => showError('No se pudo eliminar la especialidad.', err)
    });
  }

  updateSpecialty(id: number, specialtyData: Partial<Specialty>, onSuccess?: () => void): void {
    this.http.put<Specialty>(`${this.apiUrl}${id}/`, specialtyData).subscribe({
      next: (updatedSpecialty) => {
        this.specialtiesSignal.update(specialties =>
          specialties.map(s => s.id === id ? updatedSpecialty : s)
        );
        showSuccess('Especialidad actualizada correctamente.');
        onSuccess?.();
      },
      error: (err) => showError('No se pudo actualizar la especialidad.', err)
    });
  }
}

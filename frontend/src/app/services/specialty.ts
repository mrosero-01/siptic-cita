import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Interfaz basada en el serializer de django
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

  // Listar especialidades
  getSpecialties(): void {
    this.http.get<Specialty[]>(this.apiUrl).subscribe({
      next: (data) => this.specialtiesSignal.set(data),
      error: (err) => console.error('Error de conexión:', err)
    });
  }

  // Agregar especialidad nueva
  createSpecialty(specialty: Partial<Specialty>): void {
    this.http.post<Specialty>(this.apiUrl, specialty).subscribe({
      next: (newSpecialty) => {
        // Inserta la nueva especialidad al array del Signal de forma reactiva
        this.specialtiesSignal.update(specialties => [...specialties, newSpecialty]);
      },
      error: (err) => console.error('Error al guardar la especialidad en Django:', err)
    });
  }
}
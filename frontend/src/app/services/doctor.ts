import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  specialty: number;          // ID de la especialidad para Django
  specialty_name?: string;     // Nombre legible que viene del serializer
  license_number: string;
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

  // Tipamos el Signal con nuestra interfaz de Doctor
  public doctorsSignal = signal<Doctor[]>([]);

  // Listar médicos
  getDoctors(): void {
    this.http.get<Doctor[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.doctorsSignal.set(data);
      },
      error: (err) => {
        console.error('Error al traer los médicos de Django:', err);
      }
    });
  }

  // Crear médico nuevo
  createDoctor(doctor: Partial<Doctor>): void {
    this.http.post<Doctor>(this.apiUrl, doctor).subscribe({
      next: (newDoctor) => {
        // Añade el médico recién creado al Signal de forma reactiva
        this.doctorsSignal.update(doctors => [...doctors, newDoctor]);
      },
      error: (err) => console.error('Error al guardar el médico en Django:', err)
    });
  }
}
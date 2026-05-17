import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Interfaz basada en el serializer de django
export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  document_type: string;
  n_document: string;
  phone: string;
  status: boolean;
  birth_date: string;
  comments: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/patients/'; 

  patientsSignal = signal<Patient[]>([]);

  // Listar pacientes
  getPatients(): void {
    this.http.get<Patient[]>(this.apiUrl).subscribe({
      next: (data) => this.patientsSignal.set(data),
      error: (err) => console.error('Error de conexión:', err)
    });
  }

  // Agregar paciente nuevo
  createPatient(patient: Partial<Patient>): void {
    this.http.post<Patient>(this.apiUrl, patient).subscribe({
      next: (newPatient) => {
        // Añade el nuevo paciente al array actual de forma reactiva
        this.patientsSignal.update(patients => [...patients, newPatient]);
      },
      error: (err) => console.error('Error al guardar el paciente en Django:', err)
    });
  }
}
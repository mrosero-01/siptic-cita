import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { showError, showSuccess } from './api-alert';

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
  clinical_history: string | null;
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

  getPatients(): void {
    this.http.get<Patient[]>(this.apiUrl).subscribe({
      next: (data) => this.patientsSignal.set(data),
      error: (err) => showError('No se pudieron cargar los pacientes.', err)
    });
  }

  createPatient(patient: Partial<Patient> | FormData, onSuccess?: () => void): void {
    this.http.post<Patient>(this.apiUrl, patient).subscribe({
      next: (newPatient) => {
        this.patientsSignal.update(patients => [...patients, newPatient]);
        showSuccess('Paciente creado correctamente.');
        onSuccess?.();
      },
      error: (err) => showError('No se pudo crear el paciente.', err)
    });
  }

  deletePatient(id: number): void {
    this.http.delete(`${this.apiUrl}${id}/`).subscribe({
      next: () => {
        this.patientsSignal.update(patients =>
          patients.filter(patient => patient.id !== id)
        );
        showSuccess('Paciente eliminado correctamente.');
      },
      error: (err) => showError('No se pudo eliminar el paciente.', err)
    });
  }

  updatePatient(id: number, patientData: Partial<Patient> | FormData, onSuccess?: () => void): void {
    this.http.put<Patient>(`${this.apiUrl}${id}/`, patientData).subscribe({
      next: (updatedPatient) => { 
        this.patientsSignal.update(patients =>
          patients.map(p => p.id === id ? updatedPatient : p) 
        );
        showSuccess('Paciente actualizado correctamente.');
        onSuccess?.();
      },
      error: (err) => showError('No se pudo actualizar el paciente.', err)
    });
  }
}

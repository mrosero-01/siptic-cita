import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';


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

  
  getPatients(): void {
    this.http.get<Patient[]>(this.apiUrl).subscribe({
      next: (data) => this.patientsSignal.set(data),
      error: (err) => console.error('Error de conexión:', err)
    });
  }

  
  createPatient(patient: Partial<Patient>): void {
    this.http.post<Patient>(this.apiUrl, patient).subscribe({
      next: (newPatient) => {
        
        this.patientsSignal.update(patients => [...patients, newPatient]);
      },
      error: (err) => console.error('Error al guardar el paciente en Django:', err)
    });
  }

  deletePatient(id: number): void {
    this.http.delete(`${this.apiUrl}${id}/`).subscribe({
      next: ()=>{
        this.patientsSignal.update(patients =>
          patients.filter(patient => patient.id !== id)
        );
        console.log(`Paciente ${id} eliminado correctamnte.`)
      },
      error: (err) => console.error('Error al eliminar el paciente', err)
    });
  }

  updatePatient(id: number, patientData: Partial<Patient>): void {
  this.http.put<Patient>(`${this.apiUrl}${id}/`, patientData).subscribe({
    next: (updatedPatient) => { 
      this.patientsSignal.update(patients =>
        patients.map(p => p.id === id ? updatedPatient : p) 
      );
      console.log(`Paciente #${id} actualizado con éxito.`);
    },
    error: (err) => console.error('Error actualizando el paciente', err)
  });
}
}
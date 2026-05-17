import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  specialty: number;          
  specialty_name?: string;     
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

  public doctorsSignal = signal<Doctor[]>([]);

  
  getDoctors(): void {
    this.http.get<Doctor[]>(this.apiUrl).subscribe({
      next: (data) => this.doctorsSignal.set(data),
      error: (err) => console.error('Error al traer los médicos de Django:', err)
    });
  }

  
  createDoctor(doctor: Partial<Doctor>): void {
    this.http.post<Doctor>(this.apiUrl, doctor).subscribe({
      next: (newDoctor) => {
        this.doctorsSignal.update(doctors => [...doctors, newDoctor]);
      },
      error: (err) => console.error('Error al guardar el médico en Django:', err)
    });
  }

  
  deleteDoctor(id: number): void {
    this.http.delete(`${this.apiUrl}${id}/`).subscribe({
      next: () => {
        this.doctorsSignal.update(doctors => 
          doctors.filter(doctor => doctor.id !== id)
        );
        console.log(`Doctor #${id} eliminado correctamente.`);
      },
      error: (err) => console.error('Error al eliminar doctor:', err)
    });
  }

  
  updateDoctor(id: number, doctorData: Partial<Doctor>): void {
    this.http.put<Doctor>(`${this.apiUrl}${id}/`, doctorData).subscribe({
      next: (updatedDoctor) => {
        
        
        this.doctorsSignal.update(doctors =>
          doctors.map(d => d.id === id ? updatedDoctor : d)
        );
        console.log(`Doctor #${id} actualizado con éxito.`);
      },
      error: (err) => console.error('Error al actualizar el médico en Django:', err)
    });
  }
}
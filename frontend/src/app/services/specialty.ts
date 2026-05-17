import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';


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
      error: (err) => console.error('Error de conexión:', err)
    });
  }

  
  createSpecialty(specialty: Partial<Specialty>): void {
    this.http.post<Specialty>(this.apiUrl, specialty).subscribe({
      next: (newSpecialty) => {
        
        this.specialtiesSignal.update(specialties => [...specialties, newSpecialty]);
      },
      error: (err) => console.error('Error al guardar la especialidad en Django:', err)
    });
  }

  
  deleteSpecialty(id: number): void {
    this.http.delete(`${this.apiUrl}${id}/`).subscribe({
      next: ()=> {
        this.specialtiesSignal.update(specialties =>
          specialties.filter(specialty => specialty.id !== id)
        );
        console.log( `Especialidad #${id} eliminada correctamnte.`);
      },
      error: (err) => console.error('Error al eliminar la especialidad en Django', err)
    });

  }

  
  updateSpecialty(id: number, specialtyData: Partial<any>): void {
    this.http.put<any>(`${this.apiUrl}${id}/`, specialtyData).subscribe({
      next: (updatedSpecialty) => {
        this.specialtiesSignal.update(specialties =>
          specialties.map(s => s.id === id ? updatedSpecialty : s)
        );
        console.log(`Especialidad #${id} actualizada con éxito.`);
      },
      error: (err) => console.error('Error al actualizar la especialidad en Django:', err)
    });
  }
}
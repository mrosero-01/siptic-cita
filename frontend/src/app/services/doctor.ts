import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private http = inject(HttpClient);
  
  // Cambia esta URL por la de tu endpoint de Django
  private apiUrl = 'http://localhost:8000/api/doctors/'; 

  // El Signal donde se guardará la lista de médicos
  public doctorsSignal = signal<any[]>([]);

  getDoctors(): void {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.doctorsSignal.set(data);
      },
      error: (err) => {
        console.error('Error al traer los médicos de Django:', err);
      }
    });
  }
}
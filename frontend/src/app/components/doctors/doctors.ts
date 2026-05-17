import { Component, inject, OnInit } from '@angular/core';
import { DoctorService } from '../../services/doctor';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [], // Lo dejamos vacío porque no usamos Pipes raros por ahora
  templateUrl: './doctors.html',
  styleUrl: './doctors.css'
})
export class DoctorsComponent implements OnInit {
  private doctorService = inject(DoctorService);
  
  // Espejo directo del Signal del servicio para leerlo en el HTML como doctors()
  public doctors = this.doctorService.doctorsSignal;

  ngOnInit(): void {
    this.doctorService.getDoctors();
  }
}
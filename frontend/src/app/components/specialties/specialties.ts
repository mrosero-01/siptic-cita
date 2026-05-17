import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpecialtiesService } from '../../services/specialty';

@Component({
  selector: 'app-specialties',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './specialties.html',
  styleUrl: './specialties.css'
})
export class SpecialtiesComponent implements OnInit {
  // Inyectamos tu servicio adaptado
  private specialtiesService = inject(SpecialtiesService);

  // Atajo para leer el Signal directo en el HTML: specialtiesSignal()
  specialtiesSignal = this.specialtiesService.specialtiesSignal;

  ngOnInit(): void {
    // Disparamos la petición HTTP al cargar el componente
    this.specialtiesService.getSpecialties();
  }
}
import { Component, inject, OnInit } from '@angular/core';
import { PatientsService } from '../../services/patient';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [], // <-- Dejamos este arreglo vacío porque quitamos el DatePipe
  templateUrl: './patients.html',
  styleUrl: './patients.css'
})
export class PatientsComponent implements OnInit {
  private patientsService = inject(PatientsService);
  public patients = this.patientsService.patientsSignal;

  ngOnInit(): void {
    this.patientsService.getPatients();
  }
}
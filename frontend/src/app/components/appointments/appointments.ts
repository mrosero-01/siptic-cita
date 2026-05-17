import { Component, inject, OnInit } from '@angular/core';
import { AppointmentService } from '../../services/appointment';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [], // <-- Dejamos este arreglo vacío porque quitamos el DatePipe
  templateUrl: './appointments.html',
  styleUrl: './appointments.css'
})
export class AppointmentsComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  public appointments = this.appointmentService.appointmentsSignal;

  ngOnInit(): void {
    this.appointmentService.getAppointments();
  }
}
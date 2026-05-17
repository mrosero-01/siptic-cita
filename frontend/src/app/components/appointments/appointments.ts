import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AppointmentService } from '../../services/appointment';
// Inyectamos los demás servicios para alimentar los selects del modal
import { PatientsService } from '../../services/patient';
import { SpecialtiesService } from '../../services/specialty';
import { DoctorService } from '../../services/doctor'; // Ajusta el nombre según tu archivo de médicos

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointments.html',
  styleUrl: './appointments.css'
})
export class AppointmentsComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private patientsService = inject(PatientsService);
  private specialtiesService = inject(SpecialtiesService);
  private doctorsService = inject(DoctorService);
  private fb = inject(FormBuilder);

  // Listados principales que vienen de los Signals de cada servicio
  public appointments = this.appointmentService.appointmentsSignal;
  public patients = this.patientsService.patientsSignal;
  public specialties = this.specialtiesService.specialtiesSignal;
  public doctors = this.doctorsService.doctorsSignal; // Ajusta según manejes el signal de médicos

  // Controles de la interfaz reactiva
  public isModalOpen = signal<boolean>(false);
  public appointmentForm!: FormGroup;

  ngOnInit(): void {
    // Cargamos la tabla principal de citas
    this.appointmentService.getAppointments();
    this.initForm();
  }

  private initForm(): void {
    this.appointmentForm = this.fb.group({
      patient: ['', [Validators.required]],
      specialty: ['', [Validators.required]],
      doctor: ['', [Validators.required]],
      date: ['', [Validators.required]],
      start_time: ['', [Validators.required]],
      description: ['', [Validators.required]],
      status: ['PENDING', [Validators.required]] // Estado inicial por defecto
    });
  }

  public openModal(): void {
    // Disparamos la carga de los datos necesarios para llenar los dropdowns del modal
    this.patientsService.getPatients();
    this.specialtiesService.getSpecialties();
    this.doctorsService.getDoctors(); // Asegúrate de tener este método en tu servicio de médicos

    this.appointmentForm.reset({ status: 'PENDING' });
    this.isModalOpen.set(true);
  }

  public closeModal(): void {
    this.isModalOpen.set(false);
  }

  public onSubmit(): void {
    if (this.appointmentForm.valid) {
      this.appointmentService.createAppointment(this.appointmentForm.value);
      this.closeModal();
    }
  }
}
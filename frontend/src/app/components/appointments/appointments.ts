import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AppointmentService, Appointment } from '../../services/appointment'; 
import { PatientsService } from '../../services/patient';
import { SpecialtiesService } from '../../services/specialty';
import { DoctorService } from '../../services/doctor'; 
import { invalidFormAlert } from '../../services/api-alert';

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

  public appointments = this.appointmentService.appointmentsSignal;
  public patients = this.patientsService.patientsSignal;
  public specialties = this.specialtiesService.specialtiesSignal;
  public doctors = this.doctorsService.doctorsSignal; 
  public isModalOpen = signal<boolean>(false);
  public selectedAppointmentId = signal<number | null>(null); 
  public appointmentForm!: FormGroup;

  ngOnInit(): void {
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
      status: ['PENDING', [Validators.required]] 
    });
  }

  public openModal(): void {
    this.patientsService.getPatients();
    this.specialtiesService.getSpecialties();
    this.doctorsService.getDoctors(); 
    this.appointmentForm.reset({ status: 'PENDING', patient: '', specialty: '', doctor: '' });
    this.selectedAppointmentId.set(null); 
    this.isModalOpen.set(true);
  }

  public closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedAppointmentId.set(null); 
  }

  public onEditAppointment(appointment: Appointment): void {
    this.selectedAppointmentId.set(appointment.id); 
    this.patientsService.getPatients();
    this.specialtiesService.getSpecialties();
    this.doctorsService.getDoctors();
    this.appointmentForm.patchValue({
      patient: appointment.patient,         
      specialty: appointment.specialty,     
      doctor: appointment.doctor,           
      date: appointment.date,               
      start_time: appointment.start_time,   
      description: appointment.description,
      status: appointment.status            
    });
    this.isModalOpen.set(true);
  }

  private getInvalidFields(): string[] {
    const labels: Record<string, string> = {
      patient: 'Paciente',
      specialty: 'Especialidad',
      doctor: 'Médico',
      date: 'Fecha',
      start_time: 'Hora de inicio',
      description: 'Motivo de la cita',
      status: 'Estado'
    };

    return Object.keys(this.appointmentForm.controls)
      .filter(controlName => this.appointmentForm.get(controlName)?.invalid)
      .map(controlName => labels[controlName] || controlName);
  }

  public onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      invalidFormAlert(this.getInvalidFields());
      return;
    }

    const idParaEditar = this.selectedAppointmentId();

    if (idParaEditar !== null) {
      this.appointmentService.updateAppointment(idParaEditar, this.appointmentForm.value, () => this.closeModal());
    } else {
      this.appointmentService.createAppointment(this.appointmentForm.value, () => this.closeModal());
    }
  }

  public onDeleteAppointment(id: number): void {
    const confirmacion = confirm('¿Estás seguro de borrar la cita?');
    if (confirmacion) {
      this.appointmentService.deleteAppointment(id);
    }
  }
}

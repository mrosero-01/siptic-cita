import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientsService } from '../../services/patient';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patients.html',
  styleUrl: './patients.css'
})
export class PatientsComponent implements OnInit {
  private patientsService = inject(PatientsService);
  private fb = inject(FormBuilder);

  // Exponemos el Signal del servicio directo a la vista
  public patients = this.patientsService.patientsSignal;

  // Control del estado del modal y del formulario
  public isModalOpen = signal<boolean>(false);
  public patientForm!: FormGroup;

  ngOnInit(): void {
    this.patientsService.getPatients();
    this.initForm();
  }

  // Inicializa los campos basados en tu Serializer de Django
  private initForm(): void {
    this.patientForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      document_type: ['CC', [Validators.required]], // Por defecto Cédula
      n_document: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      birth_date: ['', [Validators.required]],
      comments: [''],
      status: [true] // Por defecto activo
    });
  }

  // Métodos de control para la interfaz
  public openModal(): void {
    this.patientForm.reset({ document_type: 'CC', status: true });
    this.isModalOpen.set(true);
  }

  public closeModal(): void {
    this.isModalOpen.set(false);
  }

  // Envía los datos al servicio e interactúa con Django
  public onSubmit(): void {
    if (this.patientForm.valid) {
      this.patientsService.createPatient(this.patientForm.value);
      this.closeModal();
    }
  }
}
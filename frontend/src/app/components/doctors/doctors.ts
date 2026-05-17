import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DoctorService } from '../../services/doctor';
import { SpecialtiesService } from '../../services/specialty'; // Inyectamos especialidades para el dropdown

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './doctors.html',
  styleUrl: './doctors.css'
})
export class DoctorsComponent implements OnInit {
  private doctorService = inject(DoctorService);
  private specialtiesService = inject(SpecialtiesService);
  private fb = inject(FormBuilder);
  
  // Signals de datos
  public doctors = this.doctorService.doctorsSignal;
  public specialties = this.specialtiesService.specialtiesSignal;

  // Controles de interfaz
  public isModalOpen = signal<boolean>(false);
  public doctorForm!: FormGroup;

  ngOnInit(): void {
    this.doctorService.getDoctors();
    this.initForm();
  }

  private initForm(): void {
    this.doctorForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      specialty: ['', [Validators.required]], // Enviará el ID numérico a Django
      license_number: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      status: [true] // Activo por defecto
    });
  }

  public openModal(): void {
    // Cargamos las especialidades antes de mostrar el modal
    this.specialtiesService.getSpecialties();
    
    this.doctorForm.reset({ status: true, specialty: '' });
    this.isModalOpen.set(true);
  }

  public closeModal(): void {
    this.isModalOpen.set(false);
  }

  public onSubmit(): void {
    if (this.doctorForm.valid) {
      this.doctorService.createDoctor(this.doctorForm.value);
      this.closeModal();
    }
  }
}
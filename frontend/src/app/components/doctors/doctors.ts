import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DoctorService, Doctor } from '../../services/doctor'; 
import { SpecialtiesService } from '../../services/specialty'; 
import { invalidFormAlert, showConfirm } from '../../services/api-alert';

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
  
  public doctors = this.doctorService.doctorsSignal;
  public searchTerm = signal<string>('');
  public filteredDoctors = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.doctors();
    }

    return this.doctors().filter(doctor => doctor.n_document.toLowerCase().includes(term));
  });
  public specialties = this.specialtiesService.specialtiesSignal;
  public isModalOpen = signal<boolean>(false);
  public selectedDoctorId = signal<number | null>(null); 
  public doctorForm!: FormGroup;

  ngOnInit(): void {
    this.doctorService.getDoctors();
    this.initForm();
  }

  private initForm(): void {
    this.doctorForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      specialty: ['', [Validators.required]], 
      n_document: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      status: [true] 
    });
  }

  public onSearchChange(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  public openModal(): void {
    this.specialtiesService.getSpecialties();
    this.doctorForm.reset({ status: true, specialty: '' });
    this.selectedDoctorId.set(null); 
    this.isModalOpen.set(true);
  }

  public closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedDoctorId.set(null); 
  }

  public onEditDoctor(doctor: Doctor): void {
    this.selectedDoctorId.set(doctor.id); 
    this.specialtiesService.getSpecialties(); 
    this.doctorForm.patchValue({
      first_name: doctor.first_name,
      last_name: doctor.last_name,
      specialty: doctor.specialty, 
      n_document: doctor.n_document,
      phone: doctor.phone,
      email: doctor.email,
      status: doctor.status
    });
    this.isModalOpen.set(true);
  }

  private getInvalidFields(): string[] {
    const labels: Record<string, string> = {
      first_name: 'Nombres',
      last_name: 'Apellidos',
      specialty: 'Especialidad médica',
      n_document: 'Documento',
      phone: 'Teléfono',
      email: 'Correo electrónico'
    };

    return Object.keys(this.doctorForm.controls)
      .filter(controlName => this.doctorForm.get(controlName)?.invalid)
      .map(controlName => labels[controlName] || controlName);
  }

  public onSubmit(): void {
    if (this.doctorForm.invalid) {
      this.doctorForm.markAllAsTouched();
      invalidFormAlert(this.getInvalidFields());
      return;
    }

    const idParaEditar = this.selectedDoctorId();

    if (idParaEditar !== null) {
      this.doctorService.updateDoctor(idParaEditar, this.doctorForm.value, () => this.closeModal());
    } else {
      this.doctorService.createDoctor(this.doctorForm.value, () => this.closeModal());
    }
  }

  public onDeleteDoctor(id: number): void {
    showConfirm('¿Estás seguro de querer borrar al doctor?', () => this.doctorService.deleteDoctor(id));
  }
}

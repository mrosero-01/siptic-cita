import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SpecialtiesService } from '../../services/specialty';

@Component({
  selector: 'app-specialties',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './specialties.html',
  styleUrl: './specialties.css'
})
export class SpecialtiesComponent implements OnInit {
  private specialtiesService = inject(SpecialtiesService);
  private fb = inject(FormBuilder);

  // Exponemos el Signal del servicio para la tabla
  specialtiesSignal = this.specialtiesService.specialtiesSignal;

  // Control del modal y formulario reactivo
  public isModalOpen = signal<boolean>(false);
  public specialtyForm!: FormGroup;

  ngOnInit(): void {
    this.specialtiesService.getSpecialties();
    this.initForm();
  }

  // Mapeo directo con tu SpecialtySerializer de Django
  private initForm(): void {
    this.specialtyForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      status: [true] // Activo por defecto
    });
  }

  // Métodos para interactuar con la vista
  public openModal(): void {
    this.specialtyForm.reset({ status: true });
    this.isModalOpen.set(true);
  }

  public closeModal(): void {
    this.isModalOpen.set(false);
  }

  public onSubmit(): void {
    if (this.specialtyForm.valid) {
      this.specialtiesService.createSpecialty(this.specialtyForm.value);
      this.closeModal();
    }
  }
}
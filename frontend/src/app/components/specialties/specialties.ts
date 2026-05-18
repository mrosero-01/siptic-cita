import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SpecialtiesService, Specialty } from '../../services/specialty';
import { invalidFormAlert } from '../../services/api-alert';

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

  specialtiesSignal = this.specialtiesService.specialtiesSignal;
  public isModalOpen = signal<boolean>(false);
  public selectedSpecialtyId = signal<number | null>(null); 
  public specialtyForm!: FormGroup;

  ngOnInit(): void {
    this.specialtiesService.getSpecialties();
    this.initForm();
  }

  private initForm(): void {
    this.specialtyForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      status: [true]
    });
  }

  public openModal(): void {
    this.specialtyForm.reset({ status: true });
    this.selectedSpecialtyId.set(null); 
    this.isModalOpen.set(true);
  }

  public closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedSpecialtyId.set(null); 
  }

  public onEditSpecialty(specialty: Specialty): void {
    this.selectedSpecialtyId.set(specialty.id);
    this.specialtyForm.patchValue({
      name: specialty.name,
      description: specialty.description,
      status: specialty.status
    });
    this.isModalOpen.set(true);
  }

  private getInvalidFields(): string[] {
    const labels: Record<string, string> = {
      name: 'Nombre de la especialidad',
      description: 'Descripción'
    };

    return Object.keys(this.specialtyForm.controls)
      .filter(controlName => this.specialtyForm.get(controlName)?.invalid)
      .map(controlName => labels[controlName] || controlName);
  }

  public onSubmit(): void {
    if (this.specialtyForm.invalid) {
      this.specialtyForm.markAllAsTouched();
      invalidFormAlert(this.getInvalidFields());
      return;
    }

    const idParaEditar = this.selectedSpecialtyId();

    if (idParaEditar !== null) {
      this.specialtiesService.updateSpecialty(idParaEditar, this.specialtyForm.value, () => this.closeModal());
    } else {
      this.specialtiesService.createSpecialty(this.specialtyForm.value, () => this.closeModal());
    }
  }

  public onDeleteSpecialty(id: number): void {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar esta especialidad?');
    if (confirmacion) {
      this.specialtiesService.deleteSpecialty(id);
    }
  }
}

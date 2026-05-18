import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientsService, Patient } from '../../services/patient'; 
import { invalidFormAlert, showConfirm } from '../../services/api-alert';

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

  public patients = this.patientsService.patientsSignal;
  public searchTerm = signal<string>('');
  public filteredPatients = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.patients();
    }

    return this.patients().filter(patient => patient.n_document.toLowerCase().includes(term));
  });
  public isModalOpen = signal<boolean>(false);
  public selectedPatientId = signal<number | null>(null); 
  public selectedClinicalHistory = signal<File | null>(null);
  public patientForm!: FormGroup;

  ngOnInit(): void {
    this.patientsService.getPatients();
    this.initForm();
  }

  private initForm(): void {
    this.patientForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      document_type: ['CC', [Validators.required]], 
      n_document: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      birth_date: ['', [Validators.required]],
      comments: [''],
      status: [true] 
    });
  }

  public onSearchChange(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  public onClinicalHistorySelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedClinicalHistory.set(input.files?.[0] || null);
  }

  public openModal(): void {
    this.patientForm.reset({ document_type: 'CC', status: true });
    this.selectedClinicalHistory.set(null);
    this.selectedPatientId.set(null); 
    this.isModalOpen.set(true);
  }

  public closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedPatientId.set(null); 
    this.selectedClinicalHistory.set(null);
  }

  public OnEditPatient(patient: Patient): void {
    this.selectedPatientId.set(patient.id); 
    this.selectedClinicalHistory.set(null);
    this.patientForm.patchValue({
      first_name: patient.first_name,
      last_name: patient.last_name,
      document_type: patient.document_type,
      n_document: patient.n_document,
      phone: patient.phone,
      birth_date: patient.birth_date,
      comments: patient.comments,
      status: patient.status
    });
    this.isModalOpen.set(true); 
  }

  private getInvalidFields(): string[] {
    const labels: Record<string, string> = {
      first_name: 'Nombres',
      last_name: 'Apellidos',
      document_type: 'Tipo de documento',
      n_document: 'Documento',
      phone: 'Teléfono',
      birth_date: 'Fecha de nacimiento'
    };

    return Object.keys(this.patientForm.controls)
      .filter(controlName => this.patientForm.get(controlName)?.invalid)
      .map(controlName => labels[controlName] || controlName);
  }

  private buildPatientPayload(): FormData {
    const payload = new FormData();
    const value = this.patientForm.value;

    Object.keys(value).forEach(key => {
      payload.append(key, String(value[key] ?? ''));
    });

    const file = this.selectedClinicalHistory();
    if (file) {
      payload.append('clinical_history', file);
    }

    return payload;
  }

  public onSubmit(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      invalidFormAlert(this.getInvalidFields());
      return;
    }

    const payload = this.buildPatientPayload();
    const idParaEditar = this.selectedPatientId();

    if (idParaEditar !== null) {
      this.patientsService.updatePatient(idParaEditar, payload, () => this.closeModal());
    } else {
      this.patientsService.createPatient(payload, () => this.closeModal());
    }
  }

  public OnDeletePatient(id: number): void {
    showConfirm('¿Estás seguro de borrar el paciente?', () => this.patientsService.deletePatient(id));
  }
}

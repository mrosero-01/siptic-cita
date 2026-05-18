import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AppointmentService, Appointment } from '../../services/appointment'; 
import { PatientsService } from '../../services/patient';
import { SpecialtiesService } from '../../services/specialty';
import { Doctor, DoctorService } from '../../services/doctor'; 
import { ScheduleService } from '../../services/schedule';
import { invalidFormAlert, showConfirm } from '../../services/api-alert';

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
  private scheduleService = inject(ScheduleService);
  private fb = inject(FormBuilder);

  public appointments = this.appointmentService.appointmentsSignal;
  public schedules = this.scheduleService.schedulesSignal;
  public searchTerm = signal<string>('');
  public filteredAppointments = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.appointments();
    }

    return this.appointments().filter(appointment => appointment.doctor_name.toLowerCase().includes(term));
  });
  public patients = this.patientsService.patientsSignal;
  public specialties = this.specialtiesService.specialtiesSignal;
  public doctors = this.doctorsService.doctorsSignal; 
  public selectedSpecialty = signal<number | null>(null);
  public selectedDoctor = signal<number | null>(null);
  public selectedDate = signal<string>('');
  public filteredDoctors = computed<Doctor[]>(() => {
    const specialtyId = this.selectedSpecialty();
    const doctors = this.doctors();

    if (specialtyId === null) {
      return [];
    }

    return doctors.filter(doctor => Number(doctor.specialty) === specialtyId);
  });
  public availableTimes = computed(() => {
    const doctorId = this.selectedDoctor();
    const date = this.selectedDate();

    if (doctorId === null || !date) {
      return [];
    }

    return this.schedules()
      .filter(schedule => schedule.status && Number(schedule.doctor) === doctorId && schedule.date === date)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
      .flatMap(schedule => this.buildTimeSlots(schedule.start_time, schedule.end_time))
      .filter(time => !this.isTimeOccupied(doctorId, date, time));
  });
  public isModalOpen = signal<boolean>(false);
  public selectedAppointmentId = signal<number | null>(null); 
  public appointmentForm!: FormGroup;

  ngOnInit(): void {
    this.appointmentService.getAppointments();
    this.scheduleService.getSchedules();
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

    this.appointmentForm.get('specialty')?.valueChanges.subscribe(value => {
      const specialtyId = value ? Number(value) : null;
      this.selectedSpecialty.set(specialtyId);
      const selectedDoctor = Number(this.appointmentForm.get('doctor')?.value);
      const doctorBelongsToSpecialty = this.doctors().some(doctor => doctor.id === selectedDoctor && Number(doctor.specialty) === specialtyId);

      if (!doctorBelongsToSpecialty) {
        this.appointmentForm.get('doctor')?.setValue('');
      }
    });

    this.appointmentForm.get('doctor')?.valueChanges.subscribe(value => {
      this.selectedDoctor.set(value ? Number(value) : null);
      this.clearInvalidTime();
    });

    this.appointmentForm.get('date')?.valueChanges.subscribe(value => {
      this.selectedDate.set(value || '');
      this.clearInvalidTime();
    });
  }

  private clearInvalidTime(): void {
    const currentTime = this.appointmentForm.get('start_time')?.value;
    const timeIsAvailable = this.availableTimes().some(time => time === currentTime);

    if (currentTime && !timeIsAvailable) {
      this.appointmentForm.get('start_time')?.setValue('');
    }
  }

  private isTimeOccupied(doctorId: number, date: string, time: string): boolean {
    return this.appointments().some(appointment =>
      Number(appointment.doctor) === doctorId &&
      appointment.date === date &&
      this.normalizeTime(appointment.start_time) === this.normalizeTime(time)
    );
  }

  private buildTimeSlots(start: string, end: string): string[] {
    const slots: string[] = [];
    let current = this.timeToMinutes(start);
    const last = this.timeToMinutes(end);

    while (current < last) {
      slots.push(this.minutesToTime(current));
      current += 30;
    }

    return slots;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = this.normalizeTime(time).split(':').map(Number);
    return hours * 60 + minutes;
  }

  private normalizeTime(time: string): string {
    return time.slice(0, 5);
  }

  private minutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const minutes = (totalMinutes % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  public onSearchChange(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  public openModal(): void {
    this.patientsService.getPatients();
    this.specialtiesService.getSpecialties();
    this.doctorsService.getDoctors(); 
    this.scheduleService.getSchedules();
    this.selectedSpecialty.set(null);
    this.selectedDoctor.set(null);
    this.selectedDate.set('');
    this.appointmentForm.reset({ status: 'PENDING', patient: '', specialty: '', doctor: '', date: '', start_time: '' });
    this.selectedAppointmentId.set(null); 
    this.isModalOpen.set(true);
  }

  public closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedAppointmentId.set(null); 
    this.selectedSpecialty.set(null);
    this.selectedDoctor.set(null);
    this.selectedDate.set('');
  }

  public onEditAppointment(appointment: Appointment): void {
    this.selectedAppointmentId.set(appointment.id); 
    this.patientsService.getPatients();
    this.specialtiesService.getSpecialties();
    this.doctorsService.getDoctors();
    this.scheduleService.getSchedules();
    this.selectedSpecialty.set(Number(appointment.specialty));
    this.selectedDoctor.set(Number(appointment.doctor));
    this.selectedDate.set(appointment.date);
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
    showConfirm('¿Estás seguro de borrar la cita?', () => this.appointmentService.deleteAppointment(id));
  }
}

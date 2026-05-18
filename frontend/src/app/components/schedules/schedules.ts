import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Doctor, DoctorService } from '../../services/doctor';
import { SpecialtiesService } from '../../services/specialty';
import { PatientsService } from '../../services/patient';
import { ScheduleService, DoctorSchedule } from '../../services/schedule';
import { AppointmentService } from '../../services/appointment';
import { invalidFormAlert, showConfirm } from '../../services/api-alert';

@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './schedules.html',
  styleUrl: './schedules.css'
})
export class SchedulesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private doctorService = inject(DoctorService);
  private specialtiesService = inject(SpecialtiesService);
  private patientsService = inject(PatientsService);
  private scheduleService = inject(ScheduleService);
  private appointmentService = inject(AppointmentService);

  public doctors = this.doctorService.doctorsSignal;
  public specialties = this.specialtiesService.specialtiesSignal;
  public patients = this.patientsService.patientsSignal;
  public schedules = this.scheduleService.schedulesSignal;
  public appointments = this.appointmentService.appointmentsSignal;
  public selectedSpecialty = signal<number | null>(null);
  public selectedSchedule = signal<DoctorSchedule | null>(null);
  public selectedScheduleSlots = computed(() => {
    const schedule = this.selectedSchedule();

    if (!schedule) {
      return [];
    }

    return this.buildTimeSlots(schedule.start_time, schedule.end_time)
      .filter(time => !this.isTimeOccupied(schedule.doctor, schedule.date, time));
  });
  public isAppointmentModalOpen = signal<boolean>(false);
  public scheduleForm!: FormGroup;
  public appointmentForm!: FormGroup;

  public filteredDoctors = computed<Doctor[]>(() => {
    const specialtyId = this.selectedSpecialty();

    if (specialtyId === null) {
      return [];
    }

    return this.doctors().filter(doctor => Number(doctor.specialty) === specialtyId);
  });

  public filteredSchedules = computed<DoctorSchedule[]>(() => {
    const specialtyId = this.selectedSpecialty();

    if (specialtyId === null) {
      return [];
    }

    return this.schedules().filter(schedule => Number(schedule.specialty) === specialtyId && schedule.status);
  });

  ngOnInit(): void {
    this.initForms();
    this.specialtiesService.getSpecialties();
    this.doctorService.getDoctors();
    this.patientsService.getPatients();
    this.scheduleService.getSchedules();
    this.appointmentService.getAppointments();
  }

  private initForms(): void {
    this.scheduleForm = this.fb.group({
      specialty: ['', [Validators.required]],
      doctor: ['', [Validators.required]],
      date: ['', [Validators.required]],
      start_time: ['', [Validators.required]],
      end_time: ['', [Validators.required]],
      status: [true]
    });

    this.appointmentForm = this.fb.group({
      patient: ['', [Validators.required]],
      start_time: ['', [Validators.required]],
      description: ['', [Validators.required]]
    });

    this.scheduleForm.get('specialty')?.valueChanges.subscribe(value => {
      this.selectedSpecialty.set(value ? Number(value) : null);
      this.scheduleForm.get('doctor')?.setValue('');
    });
  }

  public onSpecialtyFilterChange(event: Event): void {
    const input = event.target as HTMLSelectElement;
    this.scheduleForm.get('specialty')?.setValue(input.value);
  }

  public createSchedule(): void {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      invalidFormAlert(this.getInvalidScheduleFields());
      return;
    }

    const value = this.scheduleForm.value;
    this.scheduleService.createSchedule({
      doctor: value.doctor,
      date: value.date,
      start_time: value.start_time,
      end_time: value.end_time,
      status: value.status
    }, () => this.scheduleForm.patchValue({ doctor: '', date: '', start_time: '', end_time: '' }));
  }

  public openAppointmentModal(schedule: DoctorSchedule): void {
    this.selectedSchedule.set(schedule);
    this.appointmentForm.reset({ patient: '', start_time: '', description: '' });
    this.isAppointmentModalOpen.set(true);
  }

  public closeAppointmentModal(): void {
    this.isAppointmentModalOpen.set(false);
    this.selectedSchedule.set(null);
  }

  public createAppointmentFromSchedule(): void {
    if (this.appointmentForm.invalid || !this.selectedSchedule()) {
      this.appointmentForm.markAllAsTouched();
      invalidFormAlert(this.getInvalidAppointmentFields());
      return;
    }

    const schedule = this.selectedSchedule() as DoctorSchedule;
    const value = this.appointmentForm.value;

    this.appointmentService.createAppointment({
      patient: value.patient,
      doctor: schedule.doctor,
      specialty: schedule.specialty,
      date: schedule.date,
      start_time: value.start_time,
      description: value.description,
      status: 'PENDING'
    }, () => this.closeAppointmentModal());
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

  public getScheduleAppointments(schedule: DoctorSchedule) {
    return this.appointments()
      .filter(appointment =>
        Number(appointment.doctor) === Number(schedule.doctor) &&
        appointment.date === schedule.date &&
        this.timeToMinutes(appointment.start_time) >= this.timeToMinutes(schedule.start_time) &&
        this.timeToMinutes(appointment.start_time) < this.timeToMinutes(schedule.end_time)
      )
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }

  private isTimeOccupied(doctorId: number, date: string, time: string): boolean {
    return this.appointments().some(appointment =>
      Number(appointment.doctor) === Number(doctorId) &&
      appointment.date === date &&
      this.normalizeTime(appointment.start_time) === this.normalizeTime(time)
    );
  }

  public deleteSchedule(id: number): void {
    showConfirm('¿Estás seguro de eliminar este horario?', () => this.scheduleService.deleteSchedule(id));
  }

  private getInvalidScheduleFields(): string[] {
    const labels: Record<string, string> = {
      specialty: 'Especialidad',
      doctor: 'Médico',
      date: 'Fecha completa',
      start_time: 'Hora inicial',
      end_time: 'Hora final'
    };

    return Object.keys(this.scheduleForm.controls)
      .filter(controlName => this.scheduleForm.get(controlName)?.invalid)
      .map(controlName => labels[controlName] || controlName);
  }

  private getInvalidAppointmentFields(): string[] {
    const labels: Record<string, string> = {
      patient: 'Paciente',
      start_time: 'Hora',
      description: 'Motivo'
    };

    return Object.keys(this.appointmentForm.controls)
      .filter(controlName => this.appointmentForm.get(controlName)?.invalid)
      .map(controlName => labels[controlName] || controlName);
  }
}

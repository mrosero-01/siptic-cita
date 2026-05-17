import { Component, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar';
import { AppointmentsComponent } from './components/appointments/appointments';
import { PatientsComponent } from './components/patients/patients';
import { DoctorsComponent } from './components/doctors/doctors'; // <-- 1. Importamos
import { SpecialtiesComponent } from './components/specialties/specialties';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    SidebarComponent, 
    AppointmentsComponent,
    PatientsComponent,
    DoctorsComponent, // <-- 2. Registramos en los imports
    SpecialtiesComponent,
    UpperCasePipe 
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  currentView = signal<string>('citas');

  changeView(viewName: string) {
    this.currentView.set(viewName);
  }
}
import { Component, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar';
import { AppointmentsComponent } from './components/appointments/appointments';
import { PatientsComponent } from './components/patients/patients';
import { DoctorsComponent } from './components/doctors/doctors'; 
import { SpecialtiesComponent } from './components/specialties/specialties';
import { SchedulesComponent } from './components/schedules/schedules';
import { AiChatComponent } from './components/ai-chat/ai-chat';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    SidebarComponent, 
    AppointmentsComponent,
    PatientsComponent,
    DoctorsComponent, 
    SpecialtiesComponent,
    SchedulesComponent,
    AiChatComponent,
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
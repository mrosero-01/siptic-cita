import { Component, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar';
import { AppointmentsComponent } from './components/appointments/appointments';
import { PatientsComponent } from './components/patients/patients';

@Component({
  selector: 'app-root',
  standalone: true,
  // 2. Agregamos UpperCasePipe al arreglo de imports
  imports: [
    SidebarComponent, 
    AppointmentsComponent,
    PatientsComponent,
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
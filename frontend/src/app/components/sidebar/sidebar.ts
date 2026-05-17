import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  
  @Input() currentView: string = 'citas'; 
  
  @Output() onMenuSelect = new EventEmitter<string>();

  selectMenu(view: string) {
    this.currentView = view; 
    this.onMenuSelect.emit(view);
  }
}
import { Component, output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.html', // <-- Apunta al archivo HTML externo
  styleUrl: './sidebar.css'       // <-- Apunta al archivo CSS externo
})
export class SidebarComponent {
  onMenuSelect = output<string>();

  selectMenu(menu: string) {
    this.onMenuSelect.emit(menu);
  }
}
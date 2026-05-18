import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiService } from '../../services/ai';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-chat.html',
  styleUrl: './ai-chat.css'
})
export class AiChatComponent {
  private aiService = inject(AiService);

  public isOpen = signal(false);
  public isLoading = signal(false);
  public draft = signal('');
  public messages = signal<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hola, soy MediBot. Puedo ayudarte con citas, pacientes, médicos, horarios y mensajes administrativos.'
    }
  ]);

  public toggleChat(): void {
    this.isOpen.update(value => !value);
  }

  public onDraftChange(event: Event): void {
    this.draft.set((event.target as HTMLTextAreaElement).value);
  }

  public sendMessage(): void {
    const message = this.draft().trim();

    if (!message || this.isLoading()) {
      return;
    }

    this.messages.update(messages => [...messages, { role: 'user', content: message }]);
    this.draft.set('');
    this.isLoading.set(true);

    this.aiService.sendMessage(message).subscribe({
      next: (response) => {
        this.messages.update(messages => [...messages, {
          role: 'assistant',
          content: response.response || response.error || 'No recibí una respuesta válida del asistente.'
        }]);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.messages.update(messages => [...messages, {
          role: 'assistant',
          content: error.error?.error || 'No pude conectarme con el asistente. Revisa la configuración de Groq en el backend.'
        }]);
        this.isLoading.set(false);
      }
    });
  }

  public onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}

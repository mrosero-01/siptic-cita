import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AiChatResponse {
  response?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/ai-chat/';

  sendMessage(message: string): Observable<AiChatResponse> {
    return this.http.post<AiChatResponse>(this.apiUrl, { message });
  }
}

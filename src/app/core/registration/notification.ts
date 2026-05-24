import { Injectable, signal } from '@angular/core';


export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationMessage {
  text: string;
  type: NotificationType;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  message = signal<NotificationMessage | null>(null);
  private timeoutId?: ReturnType<typeof setTimeout>;

  show(text: string, type: NotificationType = 'info') {
    this.message.set({ text, type });

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.clear();
    }, 3000);
  }

  success(text: string) {
    this.show(text, 'success');
  }

  error(text: string) {
    this.show(text, 'error');
  }

  info(text: string) {
    this.show(text, 'info');
  }

  clear() {
    this.message.set(null);

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }
}


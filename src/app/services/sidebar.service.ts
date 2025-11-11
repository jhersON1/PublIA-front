import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  // Signal para emitir eventos de nuevo chat
  private newChatTrigger = signal<number>(0);

  /**
   * Emite un evento para iniciar un nuevo chat
   */
  triggerNewChat(): void {
    this.newChatTrigger.update(value => value + 1);
  }

  /**
   * Obtiene el signal de nuevo chat para que los componentes puedan reaccionar
   */
  getNewChatTrigger() {
    return this.newChatTrigger.asReadonly();
  }
}

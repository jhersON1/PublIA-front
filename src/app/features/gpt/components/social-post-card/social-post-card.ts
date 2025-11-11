import { Component, ChangeDetectionStrategy, computed, output, input, signal, effect, viewChild, ElementRef, HostListener } from '@angular/core';
import type { NetworkPost } from '../../interfaces/network-post.interface';

@Component({
  selector: 'app-social-post-card',
  templateUrl: './social-post-card.html',
  styleUrl: './social-post-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialPostCard {
  post = input.required<NetworkPost>();
  
  copyContent = output<string>();
  updateContent = output<{ platform: string; text: string }>();
  
  isEditing = signal(false);
  editableContent = signal('');
  
  editArea = viewChild<ElementRef<HTMLTextAreaElement>>('editArea');
  
  platformLabel = computed(() => this.post().platform ?? 'Red social');
  
  iconUrl = computed(() => {
    const file = this.normalize(this.platformLabel());
    return `${this.ICON_BASE_PATH}${file}.svg`;
  });

  formattedContent = computed(() => {
    const text = (this.post().text ?? '').trim();
    return text.replace(/\n/g, '<br>');
  });

  private readonly ICON_BASE_PATH = 'assets/network-icons/';
  private readonly DEFAULT_ICON = `${this.ICON_BASE_PATH}default.svg`;

  constructor() {
    effect(() => {
      if (!this.isEditing()) {
        this.editableContent.set((this.post().text ?? '').trim());
      }
      if (this.isEditing()) {
        this.syncEditorHeight();
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    
    if (this.isEditing() && !target.closest('app-social-post-card')) {
      this.saveAndCloseEdit();
    }
  }

  onIconError(event: Event) {
    (event.target as HTMLImageElement).src = this.DEFAULT_ICON;
  }

  onCopy() {
    this.copyContent.emit((this.post().text ?? '').trim());
  }

  toggleEditing() {
    const nextState = !this.isEditing();
    if (!nextState && this.isEditing()) {
      this.saveAndCloseEdit();
    } else {
      this.isEditing.set(nextState);
      if (nextState) {
        this.syncEditorHeight();
      }
    }
  }

  onEditInput(event: Event) {
    const { value } = event.target as HTMLTextAreaElement;
    this.editableContent.set(value);
    this.syncEditorHeight();
  }

  private normalize(name: string) {
    return name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');
  }

  private saveAndCloseEdit() {
    this.updateContent.emit({
      platform: this.post().platform,
      text: this.editableContent()
    });
    this.isEditing.set(false);
  }

  private syncEditorHeight() {
    queueMicrotask(() => {
      const textarea = this.editArea()?.nativeElement;
      if (!textarea) {
        return;
      }
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    });
  }
}

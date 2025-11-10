import { Component, ChangeDetectionStrategy, computed, output, input } from '@angular/core';
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

  private readonly ICON_BASE_PATH = 'assets/network-icons/';
  private readonly DEFAULT_ICON = `${this.ICON_BASE_PATH}default.svg`;

  private normalize(name: string) {
    return name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');
  }

  platformLabel = computed(() => this.post().platform ?? 'Red social');

  iconUrl = computed(() => {
    const file = this.normalize(this.platformLabel());
    return `${this.ICON_BASE_PATH}${file}.svg`;
  });

  formattedContent = computed(() => {
    const text = (this.post().text ?? '').trim();
    return text.replace(/\n/g, '<br>');
  });

  onIconError(event: Event) {
    (event.target as HTMLImageElement).src = this.DEFAULT_ICON;
  }

  onCopy() {
    this.copyContent.emit((this.post().text ?? '').trim());
  }
}

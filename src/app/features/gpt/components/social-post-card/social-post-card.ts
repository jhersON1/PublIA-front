import { Component, ChangeDetectionStrategy, computed, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SocialPost {
  platform: string;
  content: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-social-post-card',
  imports: [CommonModule],
  templateUrl: './social-post-card.html',
  styleUrl: './social-post-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialPostCard {
  post = input.required<SocialPost>();
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

  iconUrl = computed(() => {
    const platform = this.post().platform ?? '';
    const file = this.normalize(platform);
    return `${this.ICON_BASE_PATH}${file}.svg`;
  });

  formattedContent = computed(() =>
    (this.post().content ?? '').replace(/\n/g, '<br>')
  );

  onIconError(event: Event) {
    (event.target as HTMLImageElement).src = this.DEFAULT_ICON;
  }

  onCopy() {
    this.copyContent.emit(this.post().content);
  }
}

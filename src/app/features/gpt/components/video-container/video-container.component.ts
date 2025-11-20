import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-video-container',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './video-container.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoContainerComponent {
    videoUrl = input<string | undefined>();
    isLoading = input<boolean>(false);

    videoSelected = output<File>();

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            this.videoSelected.emit(file);
        }
    }
}

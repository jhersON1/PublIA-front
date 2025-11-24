import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
    selector: 'app-video-container',
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

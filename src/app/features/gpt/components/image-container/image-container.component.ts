import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-image-container',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './image-container.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageContainerComponent {
    imageUrl = input<string | undefined>();
    altText = input<string>('');
    isLoading = input<boolean>(false);

    imageSelected = output<File>();

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            this.imageSelected.emit(file);
        }
    }
}

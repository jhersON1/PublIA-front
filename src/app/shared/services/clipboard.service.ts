import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ClipboardService {

    /**
     * Copia el texto proporcionado al portapapeles del sistema.
     * @param text - Texto a copiar
     * @returns Promise que se resuelve cuando se completa la copia
     */
    async copyToClipboard(text: string): Promise<void> {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Error al copiar al portapapeles:', err);
            throw err;
        }
    }
}

import { Component, ElementRef, ViewChild, inject } from "@angular/core";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: "app-image-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./image-page.html",
  styleUrls: ["./image-page.css"],
})
export class ImagePageComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  private http = inject(HttpClient);
  
  isDragOver = false;
  isLoading = false;
  uploadIcon = '🖼️';
  uploadText = 'Arrastra tus imágenes aquí\no haz click para seleccionar';
  previewImages: {url: string, predictions: any[]}[] = [];
  showPreview = false;

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave() {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
    }
  }

  handleFiles(files: FileList) {
    if (files.length === 0) return;

    this.isLoading = true;
    this.uploadIcon = '⏳';
    this.uploadText = 'Analizando con YOLO11...';
    this.previewImages = [];

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const formData = new FormData();
        formData.append('file', file);

        // Preview local image first
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const item = { url: e.target.result, predictions: [] };
          this.previewImages.push(item);
          
          // Call Backend
          this.http.post<any>('http://localhost:8000/predict', formData).subscribe({
            next: (response) => {
              item.predictions = response.predictions;
              this.isLoading = false;
              this.uploadIcon = '✅';
              this.uploadText = `Análisis completado para ${files.length} imagen(es)`;
              this.showPreview = true;
            },
            error: (err) => {
              console.error('Error al analizar:', err);
              this.isLoading = false;
              this.uploadIcon = '❌';
              this.uploadText = 'Error al conectar con el servidor YOLO';
              this.showPreview = true;
            }
          });
        };
        reader.readAsDataURL(file);
      }
    });
  }
}
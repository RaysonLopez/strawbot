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
  previewImages: {url: string, width: number, height: number, predictions: any[]}[] = [];
  showPreview = false;

  // Modal properties
  isModalOpen = false;
  selectedItem: {url: string, width: number, height: number, predictions: any[]} | null = null;
  selectedBoxIndex: number | null = null;

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

        // Preview local image and get original dimensions
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const imgObj = new Image();
          imgObj.onload = () => {
            const item = { 
              url: e.target.result, 
              width: imgObj.width, 
              height: imgObj.height, 
              predictions: [] 
            };
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
          imgObj.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Modal actions
  openReportModal(item: any) {
    this.selectedItem = item;
    this.selectedBoxIndex = null; // Reset selection
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedItem = null;
    this.selectedBoxIndex = null;
  }

  selectBox(index: number) {
    if (this.selectedBoxIndex === index) {
      this.selectedBoxIndex = null; // Deseleccionar si se vuelve a hacer click
    } else {
      this.selectedBoxIndex = index;
    }
  }


  getBoxStyle(box: number[]) {
    if (!this.selectedItem || !box || box.length < 4) {
      return { left: 0, top: 0, width: 0, height: 0 };
    }
    const origWidth = this.selectedItem.width || 1;
    const origHeight = this.selectedItem.height || 1;
    
    // xmin, ymin, xmax, ymax
    const left = (box[0] / origWidth) * 100;
    const top = (box[1] / origHeight) * 100;
    const width = ((box[2] - box[0]) / origWidth) * 100;
    const height = ((box[3] - box[1]) / origHeight) * 100;
    
    return { left, top, width, height };
  }

  getCalidadInfo(className: string) {
    const name = className.toLowerCase();
    
    // 1. Fresa Sana
    if (name.includes('sana') || name.includes('excelente') || name.includes('buena') || name.includes('good') || name.includes('ripe') || name === '0' || name === 'excellent') {
      return {
        title: 'Fresa Sana',
        icon: '✨',
        color: '#2d5a2d',
        bg: '#e8f5e8',
        borderColor: '#2ecc71',
        desc: 'Fresa en perfecto estado de maduración, excelente forma y sin daños visibles. Lista para empaque y distribución.'
      };
    }
    
    // 2. Fresa Inmadura
    if (name.includes('inmadura') || name.includes('verde') || name.includes('unripe')) {
      return {
        title: 'Fresa Inmadura',
        icon: '⏳',
        color: '#8a6d3b',
        bg: '#fff9e6',
        borderColor: '#f1c40f',
        desc: 'Fresa aún verde o en proceso de maduración. Debe madurar más antes de comercializarse.'
      };
    }
    
    // 3. Fresa Malformada
    if (name.includes('malformada') || name.includes('decente') || name.includes('regular') || name.includes('medium') || name === '1' || name === 'decent') {
      return {
        title: 'Fresa Malformada',
        icon: '⚠️',
        color: '#d35400',
        bg: '#fdf2e9',
        borderColor: '#e67e22',
        desc: 'Fresa con imperfecciones estéticas o deformaciones físicas. Se recomienda su uso para procesamiento industrial (mermelada, jugos).'
      };
    }
    
    // 4. Fresa con Hongo
    if (name.includes('hongo') || name.includes('moho') || name.includes('fungus') || name.includes('mold')) {
      return {
        title: 'Fresa con Hongo',
        icon: '🍄',
        color: '#7f1d1d',
        bg: '#fef2f2',
        borderColor: '#ef4444',
        desc: 'Fresa contaminada con moho u hongos. Debe ser descartada inmediatamente para evitar contagios.'
      };
    }
    
    // 5. Fresa con Plaga
    if (name.includes('plaga') || name.includes('bicho') || name.includes('pest')) {
      return {
        title: 'Fresa con Plaga',
        icon: '🐛',
        color: '#78350f',
        bg: '#fef3c7',
        borderColor: '#d97706',
        desc: 'Fresa con daños visibles por insectos o plagas. No apta para la comercialización directa.'
      };
    }
    
    // Fallback general (Mala condición)
    return {
      title: 'Mala Condición (' + className + ')',
      icon: '🗑️',
      color: '#a94442',
      bg: '#f2dede',
      borderColor: '#e74c3c',
      desc: 'Fresa no apta para consumo o comercialización directa debido a daños graves o mala calidad.'
    };
  }
}

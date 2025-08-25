export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  preview?: string;
  uploadedAt: Date;
}

export interface FileUploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  compressImages?: boolean;
  quality?: number; // 0-1 for image compression
}

export class FileUploadManager {
  private files: Map<string, UploadedFile> = new Map();
  private options: FileUploadOptions;

  constructor(options: FileUploadOptions = {}) {
    this.options = {
      maxSize: 10 * 1024 * 1024, // 10MB default
      allowedTypes: ['image/*', 'text/*', 'application/json', 'application/javascript'],
      compressImages: true,
      quality: 0.8,
      ...options
    };
  }

  public async uploadFile(file: File): Promise<UploadedFile> {
    // Validate file
    this.validateFile(file);

    // Generate unique ID
    const id = this.generateId();
    
    // Handle different file types
    let processedFile = file;
    let preview: string | undefined;

    if (file.type.startsWith('image/')) {
      const result = await this.processImage(file);
      processedFile = result.file;
      preview = result.preview;
    }

    // Create file URL
    const url = URL.createObjectURL(processedFile);

    // Create uploaded file object
    const uploadedFile: UploadedFile = {
      id,
      name: file.name,
      type: file.type,
      size: processedFile.size,
      url,
      preview,
      uploadedAt: new Date()
    };

    // Store file
    this.files.set(id, uploadedFile);

    return uploadedFile;
  }

  public async uploadMultipleFiles(files: FileList | File[]): Promise<UploadedFile[]> {
    const fileArray = Array.from(files);
    const uploadPromises = fileArray.map(file => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  public getFile(id: string): UploadedFile | undefined {
    return this.files.get(id);
  }

  public getAllFiles(): UploadedFile[] {
    return Array.from(this.files.values());
  }

  public removeFile(id: string): boolean {
    const file = this.files.get(id);
    if (file) {
      URL.revokeObjectURL(file.url);
      return this.files.delete(id);
    }
    return false;
  }

  public clearAllFiles(): void {
    for (const file of this.files.values()) {
      URL.revokeObjectURL(file.url);
    }
    this.files.clear();
  }

  public getFilesByType(type: string): UploadedFile[] {
    return Array.from(this.files.values()).filter(file => 
      file.type.startsWith(type) || file.type === type
    );
  }

  public getImageFiles(): UploadedFile[] {
    return this.getFilesByType('image/');
  }

  public getTotalSize(): number {
    return Array.from(this.files.values()).reduce((total, file) => total + file.size, 0);
  }

  private validateFile(file: File): void {
    // Check file size
    if (this.options.maxSize && file.size > this.options.maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.formatBytes(this.options.maxSize)}`);
    }

    // Check file type
    if (this.options.allowedTypes && this.options.allowedTypes.length > 0) {
      const isAllowed = this.options.allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isAllowed) {
        throw new Error(`File type ${file.type} is not allowed`);
      }
    }
  }

  private async processImage(file: File): Promise<{ file: File; preview: string }> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image
        ctx?.drawImage(img, 0, 0);

        // Create preview (smaller version)
        const previewCanvas = document.createElement('canvas');
        const previewCtx = previewCanvas.getContext('2d');
        const maxPreviewSize = 200;
        
        let previewWidth = img.width;
        let previewHeight = img.height;
        
        if (previewWidth > maxPreviewSize || previewHeight > maxPreviewSize) {
          const ratio = Math.min(maxPreviewSize / previewWidth, maxPreviewSize / previewHeight);
          previewWidth *= ratio;
          previewHeight *= ratio;
        }

        previewCanvas.width = previewWidth;
        previewCanvas.height = previewHeight;
        previewCtx?.drawImage(img, 0, 0, previewWidth, previewHeight);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const processedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              
              const preview = previewCanvas.toDataURL('image/jpeg', 0.8);
              resolve({ file: processedFile, preview });
            } else {
              reject(new Error('Failed to process image'));
            }
          },
          file.type,
          this.options.quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  private generateId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Utility functions for drag and drop
export const createDropZone = (
  element: HTMLElement,
  onFiles: (files: File[]) => void,
  options: {
    accept?: string;
    multiple?: boolean;
    preventDefault?: boolean;
  } = {}
) => {
  const {
    accept = '*',
    multiple = true,
    preventDefault = true
  } = options;

  const handleDragOver = (e: DragEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }
    element.classList.add('drag-over');
  };

  const handleDragLeave = (e: DragEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }
    element.classList.remove('drag-over');
  };

  const handleDrop = (e: DragEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }
    element.classList.remove('drag-over');

    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length > 0) {
      onFiles(files);
    }
  };

  element.addEventListener('dragover', handleDragOver);
  element.addEventListener('dragleave', handleDragLeave);
  element.addEventListener('drop', handleDrop);

  // Return cleanup function
  return () => {
    element.removeEventListener('dragover', handleDragOver);
    element.removeEventListener('dragleave', handleDragLeave);
    element.removeEventListener('drop', handleDrop);
  };
};

// Utility for file input
export const createFileInput = (
  options: {
    accept?: string;
    multiple?: boolean;
    capture?: boolean;
  } = {}
): HTMLInputElement => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = options.accept || '*';
  input.multiple = options.multiple || false;
  if (options.capture) {
    // input.capture = options.capture; // Not supported in all browsers
  }
  return input;
};

// Utility for taking screenshots
export const captureScreenshot = async (element: HTMLElement): Promise<string> => {
  try {
    // Use html2canvas if available, otherwise fallback to basic method
    if (typeof window !== 'undefined' && (window as any).html2canvas) {
      const html2canvas = (window as any).html2canvas;
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });
      return canvas.toDataURL('image/png');
    } else {
      // Fallback method (basic)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = element.offsetWidth;
      canvas.height = element.offsetHeight;
      
      // This is a basic fallback - html2canvas is recommended for better results
      ctx?.fillRect(0, 0, canvas.width, canvas.height);
      
      return canvas.toDataURL('image/png');
    }
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    throw new Error('Failed to capture screenshot');
  }
};

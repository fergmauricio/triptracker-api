export class FileType {
  private readonly allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

  constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new Error(`Tipo de arquivo não suportado: ${value}`);
    }
  }

  private isValid(mimeType: string): boolean {
    return this.allowedTypes.includes(mimeType);
  }

  getValue(): string {
    return this.value;
  }

  isImage(): boolean {
    return this.value.startsWith('image/');
  }

  getExtension(): string {
    return this.value.split('/')[1];
  }
}

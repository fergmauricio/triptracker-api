export class FileType {
  private readonly allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ];

  constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new Error(`TIPO_ARQUIVO_NAO_SUPORTADO`);
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

  isPdf(): boolean {
    return this.value === 'application/pdf';
  }

  getExtension(): string {
    return this.value.split('/')[1];
  }
}

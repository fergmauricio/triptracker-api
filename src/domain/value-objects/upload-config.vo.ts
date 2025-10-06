export class UploadConfig {
  private constructor(
    private readonly category: string,
    private readonly maxSize: number,
    private readonly allowedTypes: string[],
  ) {}

  static create(category: string): UploadConfig {
    const configs: Record<string, { maxSize: number; allowedTypes: string[] }> =
      {
        avatar: {
          maxSize: 5 * 1024 * 1024,
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        trip: {
          maxSize: 5 * 1024 * 1024,
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        card: {
          maxSize: 10 * 1024 * 1024,
          allowedTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
          ],
        },
      };

    const config = configs[category];
    if (!config) {
      throw new Error('CATEGORIA_UPLOAD_INVALIDA');
    }

    return new UploadConfig(category, config.maxSize, config.allowedTypes);
  }

  getCategory(): string {
    return this.category;
  }

  getMaxSize(): number {
    return this.maxSize;
  }

  getAllowedTypes(): string[] {
    return this.allowedTypes;
  }

  isTypeAllowed(mimeType: string): boolean {
    return this.allowedTypes.includes(mimeType);
  }
}

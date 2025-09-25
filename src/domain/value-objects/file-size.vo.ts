export class FileSize {
  private readonly maxSize = 5 * 1024 * 1024; // 5MB

  constructor(private readonly value: number) {
    if (!this.isValid(value)) {
      throw new Error(`Arquivo muito grande: ${this.formatSize(value)}`);
    }
  }

  private isValid(size: number): boolean {
    return size <= this.maxSize && size > 0;
  }

  getValue(): number {
    return this.value;
  }

  private formatSize(bytes: number): string {
    return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
  }
}

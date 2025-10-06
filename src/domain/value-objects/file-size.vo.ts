export class FileSize {
  constructor(private readonly value: number) {}

  getValue(): number {
    return this.value;
  }

  isWithinLimit(maxSize: number): boolean {
    return this.value <= maxSize && this.value > 0;
  }

  formatSize(): string {
    return `${(this.value / 1024 / 1024).toFixed(2)}MB`;
  }
}

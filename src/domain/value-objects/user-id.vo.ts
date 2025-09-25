export class UserId {
  private readonly value: number;

  constructor(value: number) {
    if (value === undefined || value === null || value < 0) {
      throw new Error('Invalid user ID');
    }
    this.value = value;
  }

  getValue(): number {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.getValue();
  }

  toString(): string {
    return this.value.toString();
  }

  isTemporary(): boolean {
    return this.value === 0;
  }
}

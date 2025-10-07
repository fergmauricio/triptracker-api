export class TripId {
  constructor(private readonly value: number) {
    if (isNaN(value) || value < 0) {
      throw new Error('ID_VIAGEM_INVÁLIDO');
    }
  }

  getValue(): number {
    return this.value;
  }

  equals(other: TripId): boolean {
    return this.value === other.getValue();
  }
}

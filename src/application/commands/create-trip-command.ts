export class CreateTripCommand {
  constructor(
    public readonly title: string,
    public readonly description: string | null,
    public readonly thumb: string | null,
    public readonly startDate: Date | null,
    public readonly endDate: Date | null,
    public readonly userId: number,
  ) {}
}

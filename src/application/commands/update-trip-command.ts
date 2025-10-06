export class UpdateTripCommand {
  constructor(
    public readonly tripId: number,
    public readonly userId: number,
    public readonly title?: string,
    public readonly description?: string | null,
    public readonly thumb?: string | null,
    public readonly startDate?: Date | null,
    public readonly endDate?: Date | null,
  ) {}
}

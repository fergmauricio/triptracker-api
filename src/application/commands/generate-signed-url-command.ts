export class GenerateSignedUrlCommand {
  constructor(
    public readonly fileKey: string,
    public readonly expiresIn?: number,
  ) {}
}

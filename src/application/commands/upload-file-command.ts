export class UploadFileCommand {
  constructor(
    public readonly file: Express.Multer.File,
    public readonly category: string,
    public readonly entityId: string,
  ) {}
}

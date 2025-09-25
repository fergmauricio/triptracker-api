export class FileKey {
  constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new Error('File key inválida');
    }
  }

  private isValid(key: string): boolean {
    const allowedPaths = ['avatars/', 'trips/', 'maps/', 'uploads/'];
    const isValidPath = allowedPaths.some((path) => key.startsWith(path));
    const isValidFormat = /^[a-zA-Z0-9_\-./]+$/.test(key);

    return isValidPath && isValidFormat;
  }

  getValue(): string {
    return this.value;
  }

  static createAvatarKey(userId: string, originalName: string): FileKey {
    const timestamp = Date.now();
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `avatars/${userId}-${timestamp}-${safeName}`;

    return new FileKey(key);
  }
}

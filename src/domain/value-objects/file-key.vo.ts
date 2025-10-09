export class FileKey {
  constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new Error('FILE_KEY_INVALIDA');
    }
  }

  private isValid(key: string): boolean {
    const allowedPaths = ['avatars/', 'trips/', 'cards/', 'maps/'];

    const hasPathTraversal = key.includes('..') || key.includes('//');
    const isValidFormat = /^[a-zA-Z0-9_\-\.\/]+$/.test(key);
    const hasValidPath = allowedPaths.some((path) => key.startsWith(path));

    return hasValidPath && !hasPathTraversal && isValidFormat;
  }

  getValue(): string {
    return this.value;
  }

  static create(
    category: 'avatars' | 'trips' | 'cards' | 'maps',
    originalName: string,
    entityId?: string,
  ): FileKey {
    const timestamp = Date.now();
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${category}/${timestamp}-${safeName}`;
    console.log('key', key);
    return new FileKey(key);
  }

  getCategory(): string {
    return this.value.split('/')[0];
  }

  getEntityId(): string {
    const filename = this.value.split('/').pop() || '';
    return filename.split('-')[0];
  }
}

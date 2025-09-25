export interface FileStorage {
  uploadFile(file: Buffer, key: string, contentType: string): Promise<string>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  deleteFile(key: string): Promise<void>;
}

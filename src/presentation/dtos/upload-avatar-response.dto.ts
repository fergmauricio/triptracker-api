export class UploadAvatarResponseDto {
  message: string;
  url: string;
  key: string;
  signedUrl: string;

  constructor(url: string, key: string, signedUrl: string) {
    this.message = 'Avatar uploadado com sucesso!';
    this.url = url;
    this.key = key;
    this.signedUrl = signedUrl;
  }
}

export class UploadAvatarResponseDto {
  message: string;
  url: string;
  key: string;

  constructor(url: string, key: string) {
    this.message = 'Avatar uploadado com sucesso!';
    this.url = url;
    this.key = key;
  }
}

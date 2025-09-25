export class SignedUrlResponseDto {
  signedUrl: string;
  expiresIn: string;
  key: string;

  constructor(signedUrl: string, expiresIn: number, key: string) {
    this.signedUrl = signedUrl;
    this.expiresIn = `${expiresIn} segundos`;
    this.key = key;
  }
}

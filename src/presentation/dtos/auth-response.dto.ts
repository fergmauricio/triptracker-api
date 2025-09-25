export class AuthResponseDto {
  access_token: string;
  user_id: number;
  email: string;
  name: string;

  constructor(
    accessToken: string,
    userId: number,
    email: string,
    name: string,
  ) {
    this.access_token = accessToken;
    this.user_id = userId;
    this.email = email;
    this.name = name;
  }
}

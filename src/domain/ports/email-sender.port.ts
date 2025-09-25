export interface EmailSender {
  sendPasswordResetEmail(
    email: string,
    resetLink: string,
    userName?: string,
  ): Promise<boolean>;

  sendWelcomeEmail(email: string, userName: string): Promise<boolean>;
}

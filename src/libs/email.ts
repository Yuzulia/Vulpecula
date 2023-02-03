import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

const mailer = nodemailer.createTransport({
  host: import.meta.env.MAIL_HOST,
  port: import.meta.env.MAIL_PORT,
  secure: import.meta.env.MAIL_SECURE,
  auth: {
    user: import.meta.env.MAIL_AUTH_USER,
    pass: import.meta.env.MAIL_AUTH_PASS,
  },
});

export class EmailSender {
  constructor(public readonly to: string) {}

  async send(
    subject: string,
    body: { text?: string; html?: string }
  ): Promise<SMTPTransport.SentMessageInfo> {
    return await mailer.sendMail({
      from: import.meta.env.MAIL_FROM,
      to: this.to,
      subject,
      text: body.text,
      html: body.html,
    });
  }
}

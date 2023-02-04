import nodemailer from "nodemailer";
import type SMTPPool from "nodemailer/lib/smtp-pool";

const mailTransport = nodemailer.createTransport({
  pool: true,
  host: import.meta.env.MAIL_HOST,
  port: import.meta.env.MAIL_PORT,
  secure: import.meta.env.MAIL_SECURE,
  auth: {
    user: import.meta.env.MAIL_AUTH_USER,
    pass: import.meta.env.MAIL_AUTH_PASS,
  },
});

process.on("exit", () => {
  mailTransport.close();
});

export class EmailSender {
  constructor(public readonly to: string) {}

  async send(
    subject: string,
    body: { text?: string; html?: string }
  ): Promise<SMTPPool.SentMessageInfo> {
    return await mailTransport.sendMail({
      from: import.meta.env.MAIL_FROM,
      to: this.to,
      subject,
      text: body.text,
      html: body.html,
    });
  }
}

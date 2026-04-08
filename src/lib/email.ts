import nodemailer from "nodemailer";

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  });
}

export async function sendInviteEmail(
  email: string,
  token: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const appName = process.env.APP_NAME ?? "SoundStash";
  const inviteUrl = `${appUrl}/invite/${token}`;

  const transport = createTransport();

  await transport.sendMail({
    from: process.env.EMAIL_FROM ?? `${appName} <noreply@example.com>`,
    to: email,
    subject: `You've been invited to ${appName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>You're invited to ${appName}</h2>
        <p>Click the link below to set up your account. This link expires in 7 days.</p>
        <p>
          <a href="${inviteUrl}" style="
            display: inline-block;
            padding: 12px 24px;
            background: #18181b;
            color: white;
            text-decoration: none;
            border-radius: 6px;
          ">Accept Invite</a>
        </p>
        <p style="color: #71717a; font-size: 14px;">
          Or copy this link: ${inviteUrl}
        </p>
      </div>
    `,
    text: `You've been invited to ${appName}. Set up your account at: ${inviteUrl}`,
  });
}

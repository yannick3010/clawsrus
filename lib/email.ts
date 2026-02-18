import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail({
  to,
  personaName,
  botUsername,
}: {
  to: string;
  personaName: string;
  botUsername: string;
}) {
  await resend.emails.send({
    from: "ClawsRUs <hello@clawsrus.com>",
    to,
    subject: `Your ${personaName} AI is ready!`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <h1 style="color: #111;">Your ${personaName} is live!</h1>
        <p>Great news — your AI assistant has been set up and is ready to go.</p>
        <p><strong>Open Telegram and message <a href="https://t.me/${botUsername}">@${botUsername}</a> to start chatting.</strong></p>
        <h3>Getting started tips:</h3>
        <ul>
          <li>Say hello and introduce yourself</li>
          <li>Ask it to help with a real task right away</li>
          <li>The more context you give, the better it performs</li>
          <li>It remembers your conversations, so it gets better over time</li>
        </ul>
        <p style="margin-top: 32px; color: #666; font-size: 14px;">
          Questions? Reply to this email or reach us at support@clawsrus.com
        </p>
        <p style="color: #999; font-size: 12px;">— The ClawsRUs Team</p>
      </div>
    `,
  });
}

export async function sendDashboardMagicLinkEmail({
  to,
  actionLink,
}: {
  to: string;
  actionLink: string;
}) {
  await resend.emails.send({
    from: "ClawsRUs <hello@clawsrus.com>",
    to,
    subject: "Your ClawsRUs dashboard is ready",
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <h1 style="color: #111;">Your dashboard is ready</h1>
        <p>Your assistant is active. Use the secure link below to open your dashboard and start chatting.</p>
        <p>
          <a href="${actionLink}" style="display:inline-block;padding:10px 18px;background:#635bff;color:#fff;border-radius:999px;text-decoration:none;font-weight:600;">
            Open Dashboard
          </a>
        </p>
        <p style="margin-top: 20px; color: #666; font-size: 14px;">
          This link is single-use and expires. If it expires, request a new magic link on the login page.
        </p>
      </div>
    `,
  });
}

export async function sendProvisioningFailureAlert({
  userId,
  email,
  error,
}: {
  userId: string;
  email: string;
  error: string;
}) {
  await resend.emails.send({
    from: "ClawsRUs Alerts <alerts@clawsrus.com>",
    to: "yaya@gizmo.com",
    subject: `[ALERT] Provisioning failed for ${userId}`,
    html: `
      <div style="font-family: monospace;">
        <h2>Provisioning Failure</h2>
        <p><strong>User ID:</strong> ${userId}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Error:</strong></p>
        <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px;">${error}</pre>
      </div>
    `,
  });
}

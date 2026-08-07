import nodemailer from 'nodemailer';

function getTransporter() {
  const rawUser = process.env.GMAIL_USER || '';
  const rawPass = process.env.GMAIL_APP_PASSWORD || '';

  const user = rawUser.replace(/^["']|["']$/g, '').trim();
  const pass = rawPass.replace(/^["']|["']$/g, '').replace(/\s+/g, '');

  if (!user || !pass) {
    console.warn('[Email] GMAIL_USER or GMAIL_APP_PASSWORD not set in environment variables');
    return null;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  return {
    transporter,
    user,
  };
}

export async function sendRegistrationConfirmationEmail({
  toEmail,
  userName,
  eventTitle,
  startsAt,
  teamName,
  teamCode,
  enterUrl,
}: {
  toEmail: string;
  userName: string;
  eventTitle: string;
  startsAt?: string | null;
  teamName?: string | null;
  teamCode?: string | null;
  enterUrl?: string | null;
}) {
  const auth = getTransporter();
  if (!auth) {
    console.error('[Email] Failed to get email transporter');
    return false;
  }
  const { transporter, user } = auth;

  const targetEmail = toEmail?.trim();
  if (!targetEmail) {
    console.error('[Email] No recipient email specified for registration confirmation');
    return false;
  }

  const dateStr = startsAt
    ? new Date(startsAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })
    : 'To Be Announced';

  const sanitizedEnterUrl = enterUrl && !enterUrl.includes('localhost')
    ? enterUrl
    : process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes('localhost')
    ? `${process.env.NEXTAUTH_URL}/events`
    : undefined;

  const plainText = `Hi ${userName},\n\nYour registration for ${eventTitle} has been confirmed!\nStarts At: ${dateStr}${teamName ? `\nTeam Name: ${teamName}` : ''}${teamCode ? `\nTeam Code: ${teamCode}` : ''}\n\nVisit CosmoDex to participate when live.`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #06020f; color: #ffffff; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0c0818; border: 1px solid rgba(232,115,195,0.3); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        
        <div style="background: linear-gradient(135deg, #E873C3, #8D37D6); padding: 30px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900;">COSMODEX</h1>
          <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.8); font-size: 13px; font-weight: 700; text-transform: uppercase;">Event Registration Confirmed</p>
        </div>

        <div style="padding: 30px;">
          <h2 style="color: #ffffff; margin-top: 0;">🎉 You're In, ${userName}!</h2>
          <p style="color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.6;">
            Your registration for <strong style="color: #E873C3;">${eventTitle}</strong> has been successfully confirmed.
          </p>

          <div style="background-color: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-size: 13px; color: rgba(255,255,255,0.5); text-transform: uppercase; font-weight: 700;">Event Details</p>
            <p style="margin: 5px 0; font-size: 14px; color: #ffffff;"><strong>Event:</strong> ${eventTitle}</p>
            <p style="margin: 5px 0; font-size: 14px; color: #ffffff;"><strong>Starts At:</strong> ${dateStr}</p>
            ${teamName ? `<p style="margin: 5px 0; font-size: 14px; color: #ffffff;"><strong>Team Name:</strong> ${teamName}</p>` : ''}
            ${teamCode ? `<p style="margin: 5px 0; font-size: 14px; color: #E873C3;"><strong>Team Invite Code:</strong> <span style="font-family: monospace; background: rgba(232,115,195,0.2); padding: 2px 8px; border-radius: 4px;">${teamCode}</span></p>` : ''}
          </div>

          <p style="color: rgba(255,255,255,0.7); font-size: 13px; line-height: 1.6;">
            Get ready to compete! When the event goes live, you can enter the live arena and access challenges directly from your CosmoDex dashboard.
          </p>

          ${sanitizedEnterUrl ? `
          <div style="text-align: center; margin-top: 30px;">
            <a href="${sanitizedEnterUrl}" style="background: linear-gradient(135deg, #E873C3, #8D37D6); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; display: inline-block; font-size: 14px;">
              View Event Page →
            </a>
          </div>
          ` : ''}
        </div>

        <div style="background-color: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.06); padding: 15px; text-align: center; font-size: 11px; color: rgba(255,255,255,0.4);">
          CosmoDex Platform • Sent automatically upon registration.
        </div>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"CosmoDex Events" <${user}>`,
      replyTo: user,
      to: targetEmail,
      subject: `Registration Confirmed: ${eventTitle}`,
      text: plainText,
      html: htmlContent,
      headers: {
        'X-Priority': '1 (Highest)',
        'X-MSMail-Priority': 'High',
        'Importance': 'High',
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
      },
    });
    console.log(`[Email] Registration confirmation sent to ${targetEmail}. MessageID: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`[Email] Error sending registration email to ${targetEmail}:`, err);
    return false;
  }
}

export async function sendEventUpdateNotificationEmail({
  toEmails,
  eventTitle,
  subject,
  message,
}: {
  toEmails: string[];
  eventTitle: string;
  subject: string;
  message: string;
}) {
  const auth = getTransporter();
  if (!auth || !toEmails || toEmails.length === 0) return false;
  const { transporter, user } = auth;

  const validEmails = Array.from(new Set(toEmails.map(e => e?.trim()).filter(Boolean)));
  if (validEmails.length === 0) return false;

  const plainText = `[CosmoDex Event Update: ${eventTitle}]\nSubject: ${subject}\n\n${message}`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #06020f; color: #ffffff; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0c0818; border: 1px solid rgba(232,115,195,0.3); border-radius: 16px; overflow: hidden;">
        
        <div style="background: linear-gradient(135deg, #E873C3, #8D37D6); padding: 25px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 900;">COSMODEX EVENT UPDATE</h1>
        </div>

        <div style="padding: 30px;">
          <h2 style="color: #ffffff; margin-top: 0;">${eventTitle}</h2>
          <p style="color: #E873C3; font-weight: 700; font-size: 15px;">${subject}</p>
          <div style="background-color: rgba(255,255,255,0.04); border-left: 4px solid #E873C3; padding: 15px; margin: 20px 0; color: rgba(255,255,255,0.8); font-size: 14px; line-height: 1.6;">
            ${message.replace(/\n/g, '<br/>')}
          </div>
          <p style="color: rgba(255,255,255,0.6); font-size: 13px;">
            Visit CosmoDex to check live updates, schedule, and leaderboard.
          </p>
        </div>

        <div style="background-color: rgba(255,255,255,0.02); padding: 15px; text-align: center; font-size: 11px; color: rgba(255,255,255,0.4);">
          CosmoDex Events Official Announcement
        </div>
      </div>
    </div>
  `;

  let successCount = 0;

  for (const recipientEmail of validEmails) {
    try {
      const info = await transporter.sendMail({
        from: `"CosmoDex Events" <${user}>`,
        replyTo: user,
        to: recipientEmail,
        subject: `[CosmoDex] Update on ${eventTitle}: ${subject}`,
        text: plainText,
        html: htmlContent,
        headers: {
          'X-Priority': '1 (Highest)',
          'X-MSMail-Priority': 'High',
          'Importance': 'High',
          'X-Auto-Response-Suppress': 'OOF, AutoReply',
        },
      });
      console.log(`[Email] Event update sent to ${recipientEmail}. MessageID: ${info.messageId}`);
      successCount++;
    } catch (err) {
      console.error(`[Email] Error sending event update to ${recipientEmail}:`, err);
    }
  }

  return successCount > 0;
}

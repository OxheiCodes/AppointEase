import nodemailer from 'nodemailer';

let transporter;

function getMailtrapSettings() {
  const token = process.env.MAILTRAP_API_TOKEN;
  const fromEmail = process.env.MAILTRAP_FROM_EMAIL;
  const fromName = process.env.MAILTRAP_FROM_NAME || 'AppointEase';

  if (!token || !fromEmail) {
    return null;
  }

  return {
    token,
    fromEmail,
    fromName
  };
}

function getEmailSettings() {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 0);
  const secure = String(process.env.EMAIL_SECURE || '').toLowerCase() === 'true';
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const from = process.env.EMAIL_FROM;

  if (!host || !port || !user || !pass || !from) {
    return null;
  }

  return {
    host,
    port,
    secure: secure || port === 465,
    auth: {
      user,
      pass
    },
    from
  };
}

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const emailSettings = getEmailSettings();
  if (!emailSettings) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: emailSettings.host,
    port: emailSettings.port,
    secure: emailSettings.secure,
    auth: emailSettings.auth
  });

  return transporter;
}

function buildBookingEmail({ action, recipientName, businessName, date, time }) {
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hello,';
  const businessLine = businessName ? ` for ${businessName}` : '';
  const scheduleLine = `${date} at ${time}`;

  if (action === 'cancelled') {
    return {
      subject: `Appointment cancelled${businessLine}`,
      text: `${greeting}\n\nYour appointment${businessLine} on ${scheduleLine} has been cancelled.\n\nIf this was a mistake, please contact the business to rebook.`,
      html: `<p>${greeting}</p><p>Your appointment${businessLine} on <strong>${scheduleLine}</strong> has been cancelled.</p><p>If this was a mistake, please contact the business to rebook.</p>`
    };
  }

  if (action === 'rescheduled') {
    return {
      subject: `Appointment rescheduled${businessLine}`,
      text: `${greeting}\n\nYour appointment${businessLine} has been rescheduled to ${scheduleLine}.`,
      html: `<p>${greeting}</p><p>Your appointment${businessLine} has been rescheduled to <strong>${scheduleLine}</strong>.</p>`
    };
  }

  return {
    subject: `Appointment confirmed${businessLine}`,
    text: `${greeting}\n\nYour appointment${businessLine} is confirmed for ${scheduleLine}.`,
    html: `<p>${greeting}</p><p>Your appointment${businessLine} is confirmed for <strong>${scheduleLine}</strong>.</p>`
  };
}

async function sendViaMailtrapApi({
  recipientEmail,
  subject,
  text,
  html
}) {
  const settings = getMailtrapSettings();
  if (!settings) {
    return { sent: false, skipped: true };
  }

  const response = await fetch('https://send.api.mailtrap.io/api/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${settings.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: {
        email: settings.fromEmail,
        name: settings.fromName
      },
      to: [
        {
          email: recipientEmail
        }
      ],
      subject,
      text,
      html,
      category: 'AppointEase Notifications'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mailtrap API error: ${errorText}`);
  }

  return { sent: true, skipped: false };
}

export async function sendBookingNotificationEmail({
  recipientEmail,
  recipientName,
  action,
  businessName,
  date,
  time
}) {
  const mailtrapSettings = getMailtrapSettings();
  const emailSettings = getEmailSettings();
  const mailer = getTransporter();

  if ((!mailtrapSettings && (!emailSettings || !mailer)) || !recipientEmail) {
    return { sent: false, skipped: true };
  }

  const message = buildBookingEmail({
    action,
    recipientName,
    businessName,
    date,
    time
  });

  if (mailtrapSettings) {
    return sendViaMailtrapApi({
      recipientEmail,
      subject: message.subject,
      text: message.text,
      html: message.html
    });
  }

  await mailer.sendMail({
    from: emailSettings.from,
    to: recipientEmail,
    subject: message.subject,
    text: message.text,
    html: message.html
  });

  return { sent: true, skipped: false };
}
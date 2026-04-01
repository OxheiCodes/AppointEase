import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendBookingNotificationEmail } from '../src/services/emailService.js';

const envPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '.env'
);

dotenv.config({ path: envPath });

const recipientEmail = process.env.TEST_EMAIL_TO;

if (!recipientEmail) {
  console.error('Missing TEST_EMAIL_TO in backend .env.');
  process.exit(1);
}

try {
  const result = await sendBookingNotificationEmail({
    recipientEmail,
    recipientName: 'AppointEase Test User',
    action: 'confirmed',
    businessName: 'AppointEase Demo Business',
    date: '2026-04-01',
    time: '10:00'
  });

  if (result.skipped) {
    console.error('Email test skipped. Check EMAIL_* variables in backend .env.');
    process.exit(1);
  }

  console.log(`Test email sent to ${recipientEmail}`);
} catch (error) {
  console.error(`Test email failed: ${error.message}`);
  process.exit(1);
}
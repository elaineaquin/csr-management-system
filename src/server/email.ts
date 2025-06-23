'use server';

import { createTransport } from 'nodemailer';

interface SendEmailProps {
	to: string;
	subject: string;
	text: string;
}

const transporter = createTransport({
	service: 'gmail',
	host: 'smtp.gmail.com',
	port: 465,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
	tls: {
		rejectUnauthorized: false,
	},
});

export async function sendEmail({ to, subject, text }: SendEmailProps) {
	try {
		await transporter.verify();
	} catch (error) {
		console.error('Something went wrong', process.env.EMAIL_USER, process.env.EMAIL_PASS, error);
		return;
	}
	const response = await transporter.sendMail({
		from: 'no-reply@gmail.com',
		to,
		subject,
		headers: {
			priority: 'high',
			importance: 'high',
		},
		html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #dddddd; border-radius: 8px; background-color: #ffffff;">
  <h2 style="text-align: center; color: #222; font-size: 24px; margin-bottom: 20px;">
    🔐 ${subject}
  </h2>

  <div style="font-size: 16px; color: #444; line-height: 1.6;">
    ${text}
  </div>

  <p style="font-size: 13px; color: #888; margin-top: 30px;">
    This code is valid for a short time. If you didn’t request this, you can safely ignore this email.
  </p>

  <p style="font-size: 13px; color: #bbb; text-align: center; margin-top: 40px;">
    — The CSR Management Team
  </p>
</div>
    `,
	});
	console.log('Message sent', response.messageId);
	console.log('Mail sent to', to);
	return response;
}

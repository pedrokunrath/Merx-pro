// src/lib/emailService.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendWelcomeEmail = async (to: string) => {
    const msg = {
        to,
        from: 'your-email@example.com', // Use the email address or domain you verified with SendGrid
        subject: 'Bem-vindo ao Merx',
        text: 'Obrigado por se cadastrar no Merx!',
        html: '<strong>Obrigado por se cadastrar no Merx!</strong>',
    };

    try {
        await sgMail.send(msg);
        console.log('Welcome email sent successfully');
    } catch (error) {
        console.error('Error sending welcome email', error);
    }
};
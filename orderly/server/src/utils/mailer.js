import nodemailer from "nodemailer";

let transporter;

export async function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_POST || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.verify();
  return transporter;
}

/**
 * Send one HTML email. Logs a preview URL in dev when using Ethereal.
 * @param {{to:string, subject:string, html:string}} param0
 */

export async function sendMail({to, subject, html}){
    const tx = await (await getTransporter()).sendMail({
        from: '"Orderly" <no-reply@orderly.dev>',
        to,
        subject,
        html
    })

    const preview = nodemailer.getTestMessageUrl?.(tx)
    if(preview) console.log('📧 Ethereal preview:', preview)

    return tx;
}

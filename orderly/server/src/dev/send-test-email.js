import "dotenv/config"
import { sendMail } from "../utils/mailer.js"

await sendMail({
    to: "you@example.com",
    subject: "Orderly test email",
    html: "<h2>Hello from Orderly 👋</h2><p>This is a dev test.</p>"
})

console.log('Sent! Check console for the Ethereal preview URL.');
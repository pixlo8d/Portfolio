const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/send-email', async (req, res) => {
    const { name, email, message, to, from, smtpUser, smtpPass, smtpHost, smtpPort } = req.body;

    let transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: false, // true for 465, false for other ports
        auth: {
            user: smtpUser,
            pass: smtpPass
        }
    });

    try {
        let info = await transporter.sendMail({
            from: `"${name}" <${from}>`, // Use the verified email address here
            to: to,
            replyTo: email, // Set the reply-to address to the user's email
            subject: "New message from your portfolio",
            text: message,
            html: `<p>From: ${name} (${email})</p><p>${message}</p>`
        });

        console.log("Message sent: %s", info.messageId);
        res.json({ success: true, message: "Email sent successfully" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ success: false, message: "Failed to send email" });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
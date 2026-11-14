const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'orchestratorweb@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

app.post('/send-love-letter', async (req, res) => {
  try {
    const { name, letter, signature } = req.body;

    if (!letter) {
      return res.status(400).json({
        success: false,
        message: 'The love letter is required.'
      });
    }

    const attachments = [];

    if (signature && signature.startsWith('data:image/')) {
      const base64Data = signature.split(',')[1];

      attachments.push({
        filename: 'signature.png',
        content: Buffer.from(base64Data, 'base64'),
        encoding: 'base64'
      });
    }

    await transporter.sendMail({
      from: '"Love Letter" <orchestratorweb@gmail.com>',
      to: 'orchestratorweb@gmail.com',
      subject: 'A love letter from ' + (name || 'Anonymous'),
      text: 'Name: ' + (name || 'Anonymous') + '\n\nLove letter:\n' + letter,
      attachments: attachments
    });

    res.json({
      success: true,
      message: 'Love letter sent successfully.'
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Could not send the email. Please try again later.'
    });
  }
});

app.listen(3000, () => {
  console.log('SMTP server running on http://localhost:3000');
});
const express = require("express");
const router = express.Router();
const formData = require("form-data");
const Mailgun = require("mailgun.js");

const mailgun = new Mailgun(formData);
const client = mailgun.client({
  username: "Wan",
  key: process.env.MAILGUN_KEY,
});

// This root receive some data from the signup and send a mail for an administrator whith MailGun
router.post("/admin/form", async (req, res) => {
  try {
    const { username, email, newsletter } = req.body;

    const messageData = {
      from: `${username} <${email}>`,
      to: process.env.MAILGUN_USERMAIL,
      subject: "New inscription",
      text: `${username} s'est inscris sur l'application. ${
        newsletter
          ? "Le client accepte les newsletters."
          : "Le client refuse les newsletters."
      }`,
    };

    const response = await client.messages.create(
      process.env.MAILGUN_DOMAIN,
      messageData
    );

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      message: "Le site est momentanément indisponible, veuillez ré-essayer",
    });
  }
});

module.exports = router;

const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY) // Conventional format for environment variables

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: process.env.SENDER_EMAIL,
        subject: 'Thank you for joining!',
        text: `Welcome to the app, ${name}!`
    })
}

const sendDeleteEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: process.env.SENDER_EMAIL,
        subject: 'Confirmation of Account Deletion',
        text: `Thank you for using this app, ${name}! Please let us know if there is anything we could have done better.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendDeleteEmail
}
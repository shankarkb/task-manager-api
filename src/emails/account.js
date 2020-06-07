const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = async (email, name) => {
    try {
        await sgMail.send({
            to: email,
            from: 'bhavani.kbs79@gmail.com',
            subject: 'Thanks for joining in',
            text: `Welcome to the app, ${name}.`,
            html: '<strong>Welcome to the app, '+name+'.</strong> Let me know how you a long with the app.'
        })
    } catch (e) {
        console.log(e)
    }
}

const sendCancelationEmail = async (email, name) => {
    try {
        await sgMail.send({
            to: email,
            from: 'bhavani.kbs79@gmail.com',
            subject: 'Sorry to see you go',
            text: `Goodbye, ${name}. I hope to see you back sometime soon`
        })
    } catch (e) {
        console.log(e)
    }
}

// sendWelcomeEmail('shankar.kandregula@gmail.com', 'Shankar')
module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}

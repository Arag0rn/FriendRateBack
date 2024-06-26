import nodemailer from "nodemailer";
import "dotenv/config";

const { GMASS_USER, GMASS_PASSWORD, GMASS_EMAIL } = process.env;

const nodemailerConfig = {
    host: "smtp.gmass.co",
    port: 587, //  587 2525
    secure: false,
    auth: {
        user: GMASS_USER,
        pass: GMASS_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    }
};

const transport = nodemailer.createTransport(nodemailerConfig);

const sendEmail = async (data) => {
    try {
        const email = { ...data, from: GMASS_EMAIL };
        await transport.sendMail(email);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export default sendEmail;
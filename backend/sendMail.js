import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendMail = async (email,subject,message) => {
// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.MY_PASSWORD,
  },
  
});
console.log(process.env.MY_EMAIL);
console.log(process.env.MY_PASSWORD);
await transporter.sendMail({
    from: process.env.MY_EMAIL, // sender address
    to: email, // list of recipients
    subject: subject, // subject line
    text: message, // plain text body
    html: `<b>${message}</b>`, // HTML body
  });

 
}

// export default sendMail
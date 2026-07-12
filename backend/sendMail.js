import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendMail = async (email, subject, otp, type) => {

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
       user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    },
  });

  let heading = "";
  let subHeading = "";
  let description = "";

  if (type === "register") {
    heading = "Welcome to ReWear!";
    subHeading = "Verify Your Email";
    description =
      "Thank you for registering with ReWear. Please use the OTP below to verify your email address.";
  } else if (type === "forgot") {
    heading = "Reset Your Password";
    subHeading = "Password Recovery";
    description =
      "We received a request to reset your ReWear account password. Use the OTP below to continue.";
  }

  await transporter.sendMail({
    from: `"ReWear Security" <${process.env.SMTP_USER}>`,
    to: email,
    subject,

    text: `Your OTP is ${otp}. This OTP is valid for 10 minutes.`,

    html: `
      <div style="font-family:Arial,sans-serif;padding:25px;background:#f4f4f4;">
        <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:10px;">

          <h2 style="color:#16a34a;">${heading}</h2>

          <h3>${subHeading}</h3>

          <p>${description}</p>

          <div
            style="
              text-align:center;
              font-size:34px;
              font-weight:bold;
              letter-spacing:8px;
              color:#16a34a;
              border:2px dashed #16a34a;
              border-radius:8px;
              padding:20px;
              margin:25px 0;
            "
          >
            ${otp}
          </div>

          <p><b>This OTP is valid for 10 minutes.</b></p>

          <p>Please do not share this OTP with anyone.</p>

          <hr>

          <p style="color:gray;font-size:13px;">
            If you did not request this email, you can safely ignore it.
          </p>

          <p>
            Regards,<br>
            <b>ReWear Security Team</b>
          </p>

        </div>
      </div>
    `,
  });
};

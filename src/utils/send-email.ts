import { emailOptionDto } from "src/config/email_optionsDto";
const nodemailer = require('nodemailer');

export async function sendEmail(options: emailOptionDto, emailConfig): Promise<string> {
  try {
    if(!emailConfig){
        
    }
    
    const transporter = nodemailer.createTransport(emailConfig);
    
    const mailOptions = {
      from: "anthonytawk1@outlook.com",
      to: options.to,
      subject: options.subject,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    return info.response;
  } catch (error) {
    throw error;
  }
}

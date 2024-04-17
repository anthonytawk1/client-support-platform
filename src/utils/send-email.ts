import { emailOptionDto } from "src/config/email_optionsDto";
const nodemailer = require('nodemailer');

export async function sendEmail(options: emailOptionDto, emailConfig): Promise<string> {
  try {
    // Create a Nodemailer transporter using SMTP transport
    if(!emailConfig){
        console.log('config service not provided!!!');
        
    }
    // const email = configService.get<any>('host')
    // console.log(email);
    
    const transporter = nodemailer.createTransport(emailConfig);
    console.log(options);
    
    // Setup email data
    const mailOptions = {
      from: "anthonytawk1@outlook.com",
      to: options.to,
      subject: options.subject,
      text: options.text,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
    return info.response;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
}

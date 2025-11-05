import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { generateOtpEmailBody } from '../lib/otpEmailTamplate.js';


dotenv.config();


const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.SMTP_USER,
        pass:process.env.SMTP_PASS
    }
});


 transporter.verify((error) =>{
    if(!error){
        console.log("SMTP with nodemailer is ready to send emails");
        
    }else{
        console.error("SMTP connection error",error.message);
        
    }
});


const sendOtpToEmail = async(email,otp) =>{
   const  html = generateOtpEmailBody(otp);

    await transporter.sendMail({
    from:`web<${process.env.SMTP_USER}>`,
    to:email || null,
    subject : 'Verification code',
    html,

})
};



export default sendOtpToEmail;
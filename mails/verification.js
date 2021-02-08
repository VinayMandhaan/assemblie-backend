
const nodemailer=require('nodemailer');
require('dotenv').config();
const smtpTransport = require('nodemailer/lib/smtp-transport')
const username=process.env.email;
const password=process.env.password;
const host=process.env.host;
const smtp_port=process.env.SMTP_PORT;

module.exports= async function verification_email(data){
    console.log(smtp_port,'PORT')
    let transporter = nodemailer.createTransport(new smtpTransport({
        name:username,
        host: host,
        port: smtp_port,
        auth: {
            user: username, // generated ethereal user
            pass: password // generated ethereal password
        },
        debug: true,
        tls:{
            rejectUnauthorized:false
        }
    }));
    let html_data = `
    <p>Dear ${data.name},</p>
    <h2>Welcome to Assemblie Community!</h2>
    <h4>Below is your Verification Code.</h4>
    <h1>${data.verification_code}</h1>
    <p>Please enter this code in your verification area input and join us.</p>
    <a href="#" target="_blank" >Go To Verification Link</a>
    <p>Note: This verification code is valid for 30 minutes only. After 30 minutes this code will be expired and you will have to click on resend code to get a new code on your email.</p>
    <h4>Sincerely,</h4>
    <h3>Team Assemblie<h3>
    `;

    let mailData = {
        from: '"Assemblie_no_reply" <' + username + '>', // sender address
        to: data.mail, // list of receivers
        subject: "Verification Email from Assemblie", // Subject line
        text: "Here is your verification code for Assemblie", // plain text body
        html: html_data // html body
    };


    console.log(mailData.to + " "+ `${username} // ${password}`);

    transporter.sendMail(mailData,(error,info)=>{
       if(error){
           console.log(error);
       }

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    });
};


// export default verification_email;

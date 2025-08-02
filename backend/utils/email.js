const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendOtpEmail = async (to, otp) => {
    const msg = {
        to,
        from: {
            email: 'nitinrawat0053@gmail.com',
            name: 'Nitin Singh Rawat'
        },
        subject: 'Your Wellness Session OTP',
        text: `Your OTP is: ${otp}`,
        html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
    };
    try {
        await sgMail.send(msg);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

module.exports = { sendOtpEmail }; 
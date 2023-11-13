import nodemailer from "nodemailer";

const { META_UA_PASSWORD, META_UA_EMAIL } = process.env;

const nodemailerConfig = {
  host: "smtp.meta.ua",
  port: 465,
  secure: true,
  auth: {
    user: META_UA_EMAIL,
    pass: META_UA_PASSWORD,
  },
};

const transport = nodemailer.createTransport(nodemailerConfig);

const sendEmail = (data) => {
  const email = { ...data, from: META_UA_EMAIL };
  return transport.sendMail(email);
};

export default sendEmail;

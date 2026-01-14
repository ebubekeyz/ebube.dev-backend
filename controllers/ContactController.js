import Contact from "../models/Contact.js";
import { StatusCodes } from "http-status-codes";
import BadRequestError from "../errors/badRequest.js";
import UnauthorizedError from "../errors/unauthorized.js";
import nodemailer from "nodemailer";

export const createContact = async (req, res) => {
  const { subject, name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    throw new BadRequestError("Please provide all details");
  }

  const contact = await Contact.create({
    subject,
    name,
    email,
    phone,
    message,
  });

  // const transporter = nodemailer.createTransport({
  //   host: "smtp.gmail.com",
  //   port: 465,
  //   secure: true,
  //   auth: {
  //     user: process.env.GMAIL_USER,
  //     pass: process.env.GMAIL_PASS,
  //   },
  //   tls: {
  //     rejectUnauthorized: false,
  //   },
  // });

  // try {
  //   // Admin email
  //   await transporter.verify();
  //   await transporter.sendMail({
  //     from: `"Ebube.dev" <${process.env.GMAIL_USER}>`,
  //     to: "ebubeoffor2025@gmail.com",
  //     subject: `${subject} from ${name}`,
  //     html: `
  //       <p><strong>${subject}</strong></p>
  //       <p>${message}</p>
  //       <p>
  //         From: ${name}<br/>
  //         Email: ${email}<br/>
  //         Phone: ${phone}
  //       </p>
  //     `,
  //     replyTo: email,
  //   });

  //   // Auto-reply to user
  //   await transporter.sendMail({
  //     from: `"Ebube.dev" <${process.env.GMAIL_USER}>`,
  //     to: email,
  //     subject: "Message received – Weld Central",
  //     html: `
  //       <p><strong>Thank you for contacting Weld Central!</strong></p>
  //       <p>We’ve received your message and will respond shortly.</p>
  //       <p>Best regards,<br/>Weld Central Team</p>
  //     `,
  //   });
  // } catch (err) {
  //   console.error("Nodemailer failed:", err.message);
  // }

  let transporter = nodemailer.createTransport({
    host: process.env.ZOHO_HOST, // Use smtp.zoho.eu for the EU datacenter
    secure: true, // Use SSL
    port: process.env.ZOHO.PORT, // Port 465 for SSL or 587 for TLS
    auth: {
      user: process.env.ZOHO_USER, // Your Zoho Mail email address
      pass: process.env.ZOHO_PASS, // Your email password or a generated app password
    },
  });

  const mailOptions = {
    from: process.env.ZOHO_USER, // Sender address
    to: process.env.ZOHO_USER, // List of recipients
    subject: subject, // Subject line
    text: message, // Plain text body
    // html: '<b>This is the HTML body of the email</b>' // HTML body (optional)
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });

  res
    .status(StatusCodes.CREATED)
    .json({ msg: "Thank you for your submission!" });
};

export const getContact = async (req, res) => {
  let { date, status, subject, name, email, phone, message, sort } = req.query;

  let result = Contact.find({});

  if (phone) {
    result = Contact.find({ phone: { $eq: phone } });
  }
  if (message) {
    result = Contact.find({ message: { $eq: message } });
  }

  if (status) {
    result = Contact.find({
      status: { $eq: status },
    });
  }
  if (name) {
    result = Contact.find({
      name: { $eq: name },
    });
  }
  if (email) {
    result = Contact.find({
      email: { $eq: email },
    });
  }
  if (subject) {
    result = Contact.find({
      subject: { $eq: subject },
    });
  }

  if (sort === "latest") {
    result = result.sort("-createdAt");
  }
  if (sort === "oldest") {
    result = result.sort("createdAt");
  }

  if (sort === "a-z") {
    result = result.sort("cargoName");
  }
  if (sort === "z-a") {
    result = result.sort("-cargoName");
  }

  if (date) {
    result = Contact.find({
      date: { $regex: date, $options: "i" },
    });
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const contact = await result;

  const totalContact = await Contact.countDocuments();
  const numOfPage = Math.ceil(totalContact / limit);

  res.status(StatusCodes.OK).json({
    contact: contact,
    meta: {
      pagination: {
        page: page,
        total: totalContact,
        pageCount: numOfPage,
      },
    },
  });
};

export const getSingleContact = async (req, res) => {
  const { id: contactId } = req.params;
  const contact = await Contact.findOne({ _id: contactId });
  if (!contact) {
    throw new BadRequestError(`Contact with id ${contactId} does not exist`);
  }

  res.status(StatusCodes.OK).json({ contact: contact });
};

export const editSingleContact = async (req, res) => {
  const { id: contactId } = req.params;
  const contact = await Contact.findOneAndUpdate({ _id: contactId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!contact) {
    throw new BadRequestError(`Contact with id ${contactId} does not exist`);
  }
  res.status(StatusCodes.OK).json({ contact: contact });
};

export const editUserContact = async (req, res) => {
  const { id: userId } = req.params;
  const contact = await Contact.updateMany({ user: userId }, req.body);

  res.status(StatusCodes.OK).json({ contact: contact });
};

export const deleteSingleContact = async (req, res) => {
  const { id: contactId } = req.params;
  const contact = await Contact.findByIdAndDelete({
    _id: contactId,
  });
  if (!contact) {
    throw new BadRequestError(`Contact with id ${contactId} does not exist`);
  }
  res.status(StatusCodes.OK).json({ msg: "Contact Deleted" });
};

export const deleteAllContact = async (req, res) => {
  const contact = await Contact.deleteMany();
  res.status(StatusCodes.OK).json({ msg: "Contact Deleted" });
};

export const deleteUserContact = async (req, res) => {
  const { id: userId } = req.params;
  const contact = await Contact.deleteMany({ user: userId });

  res.status(StatusCodes.OK).json({ msg: "Contact successfully deleted" });
};

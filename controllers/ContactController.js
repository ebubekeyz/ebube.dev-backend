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

  const transporter = nodemailer.createTransport({
    host: process.env.ZOHO_HOST,
    port: Number(process.env.ZOHO_PORT),
    secure: true,
    auth: {
      user: process.env.ZOHO_USER,
      pass: process.env.ZOHO_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Ebube.dev Contact" <${process.env.ZOHO_USER}>`,
    to: "ebubeoffor2025@gmail.com", // send to a DIFFERENT inbox
    subject: subject || "New Contact Message",
    replyTo: email,
    html: `
    <h3>New Contact Message</h3>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
  `,
  });

  await transporter.sendMail({
    from: `"Ebube.dev" <${process.env.ZOHO_USER}>`,
    to: email,
    subject: "We received your message",
    html: `
    <p>Hello ${name},</p>
    <p>Thank you for contacting us. We’ve received your message and will reply shortly.</p>
    <p>— Ebube.dev</p>
  `,
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

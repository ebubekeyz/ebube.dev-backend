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

  if (name == "" || email == "" || phone == "" || message == "") {
    throw new BadRequestError("Fields Should not be empty");
  }

  const contact = await Contact.create({
    subject,
    name,
    email,
    phone,
    message,
  });
  // let testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: process.env.GMAIL_HOST,
    port: process.env.GMAIL_PORT,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  let info = await transporter.sendMail({
    from: `"${name}" <${email}>`,
    to: `ebubeoffor2025@gmail.com`,
    subject: `${subject} from ${name}`,
    html: `<p><strong>${subject}</strong></p>
<p>${message}</p>

<p>From<br />${name}</p> <p>Phone:<br />${phone}</p>  `,
  });

  let info2 = await transporter.sendMail({
    from: `"Weld Central " <ebubeoffor2025@gmail.com>`,
    to: `${email}`,
    subject: `Message from Weld Central Support Team`,
    html: ` <p><strong>Thank you for Your Submission!</strong></p>
<p>We&rsquo;ve successfully received your form and appreciate you taking the time to provide us with your information. Our team will review your submission and get back to you as soon as possible.</p>
<p>If you have any urgent questions or need further assistance, please don&rsquo;t hesitate to reach out to us at help.weldcentral@gmail.</p>
<p>Thank you for choosing Weld Central. We look forward to connecting with you soon!</p>
<p>Best regards,<br />The Weld Central Team</p>  `,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ msg: "Thank you for Your Submission!" });
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

import { createRequire } from "module";
const require = createRequire(import.meta.url);

import express from "express";
const app = express();

import "express-async-errors";
import connectDB from "./db/connect.js";
require("dotenv").config();

import path from "path";

import authRouter from "./routes/authRouter.js";
import contactRouter from "./routes/contactRouter.js";

import notificationRouter from "./routes/notificationRouter.js";

// import uploadRouter from './routes/uploadRouter.js';
import fileUpload from "express-fileupload";
const cloudinary = require("cloudinary");
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

import errorHandlerMiddleware from "./middleware/error-handler.js";
import notFoundMiddleware from "./middleware/not-found.js";

import cors from "cors";
import xss from "xss-clean";
import helmet from "helmet";

// let originUrl =
//   process.env.NODE_ENV !== "production"
//     ? "http://localhost:5173"
//     : "https://ebubedev.netlify.app";

// app.use(
//   cors({
//     origin: originUrl,
//   })
// );

const allowedOrigins = [
  "http://localhost:5173",
  "https://ebubedev.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(xss());

app.use(fileUpload({ useTempFiles: true }));

app.use(express.static("./public"));
app.use(express.json());

app.use("/api/auth", authRouter);

// app.use('/api/upload', uploadRouter);
app.use("/api/contact", contactRouter);
app.use("/api/notification", notificationRouter);

app.use(errorHandlerMiddleware);
app.use(notFoundMiddleware);

const port = process.env.PORT || 7000;

const start = async () => {
  await connectDB(process.env.MONGO_URI);
  app.listen(port, () => console.log(`Server listening on port ${port}`));
};

start();

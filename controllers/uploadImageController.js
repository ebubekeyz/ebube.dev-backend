import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import path from 'path';
import { StatusCodes } from 'http-status-codes';
import fs from 'fs';
import cloudinary from 'cloudinary';

const upload = async (req, res) => {
  const result = await cloudinary.v2.uploader.upload(
    req.files.image.tempFilePath,

    {
      use_filename: true,
      folder: 'optilogix',
    }
  );
  fs.unlinkSync(req.files.image.tempFilePath);
  return res.status(StatusCodes.OK).json({ image: { src: result.secure_url } });
};

export default upload;

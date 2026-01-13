import jwt from 'jsonwebtoken';
import UnauthorizedError from '../errors/unauthorized.js';

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    throw new UnauthorizedError('Authentication Invalid');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const {
      userId,
      id,
      email,
      lastName,
      firstName,
      phoneNumber,
      officeNumber,
      companyName,
      trackId,
      address,
      password,
      photo,
      role,
    } = payload;

    req.user = {
      userId,
      id,
      email,
      lastName,
      firstName,
      phoneNumber,
      officeNumber,
      companyName,
      trackId,
      address,
      password,
      photo,
      role,
    };
    next();
  } catch (error) {
    throw new UnauthorizedError('Authentication Invalid');
  }
};

export default auth;

import UnauthorizedError from '../errors/unauthorized.js';

const authPermission = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      throw new UnauthorizedError('Not Permitted');
    }
    next();
  };
};

export default authPermission;

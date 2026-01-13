import UnauthorizedError from '../errors/unauthorized.js';

const checkPermission = (requestUser, resourceUserId) => {
  if (requestUser === 'admin' || requestUser === 'owner') return;
  if (resourceUserId === resourceUserId.toString()) return;
  throw new UnauthorizedError('Not authorized to access this route');
};

module.exports = checkPermission;

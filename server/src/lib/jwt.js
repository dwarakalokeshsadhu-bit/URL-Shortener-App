import jwt from 'jsonwebtoken';

const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

export function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export function sendAuthCookie(res, userId) {
  res.cookie('token', signToken(userId), cookieOptions);
}

export function clearAuthCookie(res) {
  res.clearCookie('token', cookieOptions);
}

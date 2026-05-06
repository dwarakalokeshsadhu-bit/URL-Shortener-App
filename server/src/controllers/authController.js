import { clearAuthCookie, sendAuthCookie } from '../lib/jwt.js';
import { User } from '../models/User.js';
import { getPlanLimits } from '../config/plans.js';

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    plan: user.plan || 'free',
    billingStatus: user.billingStatus || 'none',
    limits: getPlanLimits(user.plan),
    createdAt: user.createdAt
  };
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email is already registered' });

    const user = await User.create({ name, email, password });
    sendAuthCookie(res, user._id);
    res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    sendAuthCookie(res, user._id);
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function check(req, res) {
  res.json({ user: publicUser(req.user) });
}

export function logout(_req, res) {
  try {
    clearAuthCookie(res);
  } catch (error) {
    console.warn('Could not clear auth cookie:', error.message);
  }
  res.json({ ok: true });
}

export function googleAuth(_req, res) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(400).send('Google OAuth is missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.');
  }

  const callbackUrl = `${process.env.APP_URL || 'http://localhost:5000'}/api/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account'
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

export async function googleCallback(req, res, next) {
  try {
    const callbackUrl = `${process.env.APP_URL || 'http://localhost:5000'}/api/auth/google/callback`;
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: req.query.code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}?auth=google_failed`);
    }

    const tokens = await tokenResponse.json();
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const profile = await profileResponse.json();

    let user = await User.findOne({ email: profile.email });
    if (!user) {
      user = await User.create({
        name: profile.name || profile.email,
        email: profile.email,
        googleId: profile.sub,
        authProvider: 'google'
      });
    } else {
      user.googleId = profile.sub;
      user.authProvider = user.authProvider || 'google';
      await user.save();
    }

    sendAuthCookie(res, user._id);
    res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
  } catch (error) {
    next(error);
  }
}

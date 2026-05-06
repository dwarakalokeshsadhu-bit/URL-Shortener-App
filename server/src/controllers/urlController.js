import { customAlphabet } from 'nanoid';
import { UAParser } from 'ua-parser-js';
import { Analytics } from '../models/Analytics.js';
import { Url } from '../models/Url.js';
import { normalizeUrl, validateAlias } from '../utils/validateUrl.js';
import { getPlanLimits } from '../config/plans.js';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 7);

function appUrl(req) {
  const configuredUrl = process.env.APP_URL?.trim();
  const derivedUrl = `${req.protocol}://${req.get('host')}`;
  const publicUrl = (configuredUrl || derivedUrl).replace(/\/$/, '');

  if (process.env.NODE_ENV === 'production' && /localhost|127\.0\.0\.1/i.test(publicUrl)) {
    throw Object.assign(new Error('Production APP_URL must be your deployed backend URL, not localhost.'), { status: 500 });
  }

  return publicUrl;
}

function publicUrl(req, url) {
  const data = typeof url.toObject === 'function' ? url.toObject() : url;
  return {
    ...data,
    shortUrl: `${appUrl(req)}/${data.shortId}`
  };
}

function classifyDevice(userAgent) {
  const parser = new UAParser(userAgent);
  const type = parser.getDevice().type;
  if (type === 'mobile' || type === 'tablet') return type;
  if (/bot|crawler|spider/i.test(userAgent || '')) return 'bot';
  return 'desktop';
}

export async function createUrl(req, res, next) {
  try {
    const originalUrl = normalizeUrl(req.body.originalUrl);
    const customAlias = validateAlias(req.body.customAlias);
    const expiryDate = req.body.expiryDate ? new Date(req.body.expiryDate) : undefined;
    const shortId = customAlias || nanoid();

    if (req.user) {
      const limits = getPlanLimits(req.user.plan);
      const linkCount = await Url.countDocuments({ userId: req.user._id });

      if (linkCount >= limits.maxLinks) {
        return res.status(403).json({ message: `${limits.name} plan allows up to ${limits.maxLinks} links. Upgrade to create more.` });
      }

      if (customAlias && !limits.customAlias) {
        return res.status(403).json({ message: 'Custom aliases are available on Creator and Business plans.' });
      }

      if (expiryDate && !limits.expiry) {
        return res.status(403).json({ message: 'Expiry dates are available on Creator and Business plans.' });
      }
    }

    const existing = await Url.findOne({ shortId });
    if (existing) return res.status(409).json({ message: 'That alias is already taken' });

    const url = await Url.create({
      originalUrl,
      shortId,
      shortUrl: `${appUrl(req)}/${shortId}`,
      userId: req.user?._id,
      expiryDate
    });

    res.status(201).json({ url: publicUrl(req, url) });
  } catch (error) {
    next(error);
  }
}

export async function listUrls(req, res, next) {
  try {
    const urls = await Url.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ urls: urls.map((url) => publicUrl(req, url)) });
  } catch (error) {
    next(error);
  }
}

export async function updateUrl(req, res, next) {
  try {
    const updates = {};
    if (req.body.originalUrl) updates.originalUrl = normalizeUrl(req.body.originalUrl);
    if (typeof req.body.isActive === 'boolean') updates.isActive = req.body.isActive;
    if (req.body.expiryDate !== undefined) updates.expiryDate = req.body.expiryDate ? new Date(req.body.expiryDate) : null;

    const url = await Url.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, updates, { new: true });
    if (!url) return res.status(404).json({ message: 'URL not found' });
    res.json({ url: publicUrl(req, url) });
  } catch (error) {
    next(error);
  }
}

export async function deleteUrl(req, res, next) {
  try {
    const url = await Url.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!url) return res.status(404).json({ message: 'URL not found' });
    await Analytics.deleteMany({ urlId: url._id });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
}

export async function redirectToOriginal(req, res, next) {
  try {
    const url = await Url.findOne({ shortId: req.params.shortId });
    if (!url || !url.isActive) return res.status(404).send('Link not found');
    if (url.expiryDate && url.expiryDate < new Date()) return res.status(410).send('Link expired');

    url.clicks += 1;
    await Promise.all([
      url.save(),
      Analytics.create({
        urlId: url._id,
        ip: req.ip,
        device: classifyDevice(req.get('user-agent')),
        userAgent: req.get('user-agent'),
        referrer: req.get('referer')
      })
    ]);

    res.redirect(302, url.originalUrl);
  } catch (error) {
    next(error);
  }
}

export async function analytics(req, res, next) {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });
    if (!url) return res.status(404).json({ message: 'URL not found' });

    const [devices, timeline] = await Promise.all([
      Analytics.aggregate([{ $match: { urlId: url._id } }, { $group: { _id: '$device', count: { $sum: 1 } } }]),
      Analytics.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, clicks: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({ totalClicks: url.clicks, devices, timeline });
  } catch (error) {
    next(error);
  }
}

import { getPlanLimits, PLAN_LIMITS } from '../config/plans.js';

export async function getBilling(req, res) {
  res.json({
    plan: req.user.plan || 'free',
    billingStatus: req.user.billingStatus || 'none',
    limits: getPlanLimits(req.user.plan),
    billingDetails: req.user.billingDetails || {},
    plans: PLAN_LIMITS
  });
}

export async function updateBilling(req, res, next) {
  try {
    const { selectedPlan, fullName, email, phone, company, taxId, address, paymentReference } = req.body;
    if (!['creator', 'business'].includes(selectedPlan)) {
      return res.status(400).json({ message: 'Choose Creator or Business to upgrade.' });
    }

    req.user.plan = selectedPlan;
    req.user.billingStatus = 'active';
    req.user.billingDetails = {
      fullName,
      email,
      phone,
      company,
      taxId,
      address,
      selectedPlan,
      paymentReference,
      updatedAt: new Date()
    };

    await req.user.save();

    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        plan: req.user.plan,
        billingStatus: req.user.billingStatus,
        limits: getPlanLimits(req.user.plan),
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
}

export const PLAN_LIMITS = {
  free: {
    name: 'Free',
    maxLinks: 5,
    customAlias: false,
    expiry: false,
    qrCode: false,
    apiAccess: false,
    customDomains: false
  },
  creator: {
    name: 'Creator',
    maxLinks: 1000,
    customAlias: true,
    expiry: true,
    qrCode: true,
    apiAccess: false,
    customDomains: false
  },
  business: {
    name: 'Business',
    maxLinks: 10000,
    customAlias: true,
    expiry: true,
    qrCode: true,
    apiAccess: true,
    customDomains: true
  }
};

export function getPlanLimits(plan = 'free') {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

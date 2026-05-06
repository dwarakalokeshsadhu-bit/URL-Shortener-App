import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Copy,
  ExternalLink,
  Link,
  LogOut,
  Mail,
  MapPin,
  MousePointerClick,
  Pencil,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Timer,
  Trash2,
  WandSparkles,
  Zap
} from 'lucide-react';
import QRCode from 'qrcode';
import { useAppStore } from './store/useAppStore';

const sampleUrls = [
  {
    _id: 'demo-1',
    originalUrl: 'https://github.com/projects/linknova-case-study',
    shortUrl: 'https://1nova.io/s/9xK2p',
    shortId: '9xK2p',
    clicks: 24800,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'demo-2',
    originalUrl: 'https://portfolio.example.com/recruiter-campaign',
    shortUrl: 'https://1nova.io/s/hire',
    shortId: 'hire',
    clicks: 6820,
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

function App() {
  const { user, urls, result, loading, error, checkAuth, createUrl, fetchUrls, logout } = useAppStore();
  const [view, setView] = useState('landing');
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      fetchUrls();
      setView('dashboard');
    }
  }, [user, fetchUrls]);

  useEffect(() => {
    if (!user || view !== 'dashboard') return undefined;

    const syncUrls = () => {
      fetchUrls();
    };

    const syncWhenVisible = () => {
      if (!document.hidden) syncUrls();
    };

    window.addEventListener('focus', syncUrls);
    document.addEventListener('visibilitychange', syncWhenVisible);
    const intervalId = window.setInterval(syncUrls, 5000);

    return () => {
      window.removeEventListener('focus', syncUrls);
      document.removeEventListener('visibilitychange', syncWhenVisible);
      window.clearInterval(intervalId);
    };
  }, [user, view, fetchUrls]);

  const visibleUrls = user ? urls : sampleUrls;

  return (
    <main className="min-h-screen bg-nova-ink text-white">
      <Header
        user={user}
        view={view}
        onNavigate={setView}
        onAuth={(mode) => {
          setAuthMode(mode);
          setView('auth');
        }}
        onLogout={logout}
      />

      {view === 'dashboard' ? (
        <Dashboard urls={visibleUrls} user={user} onNavigate={setView} />
      ) : view === 'pricing' ? (
        <PlanPricingPage user={user} onSelectPlan={(plan) => (user ? setView(`billing:${plan}`) : (setAuthMode('signup'), setView('auth')))} />
      ) : view.startsWith('billing') ? (
        <BillingPage selectedPlan={view.split(':')[1] || 'creator'} onDone={() => setView('dashboard')} />
      ) : view === 'api' ? (
        <ApiPage />
      ) : view === 'auth' ? (
        <AuthPage mode={authMode} setMode={setAuthMode} onDone={() => setView('dashboard')} />
      ) : (
        <Landing
          loading={loading}
          error={error}
          result={result}
          onSubmit={createUrl}
          onSignup={() => {
            setAuthMode('signup');
            setView('auth');
          }}
        />
      )}
    </main>
  );
}

function Header({ user, view, onNavigate, onAuth, onLogout }) {
  const handleLogout = async () => {
    await onLogout();
    onNavigate('landing');
  };

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-white/0">
      <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-7 sm:px-10 lg:px-16">
        <button type="button" className="text-[26px] font-extrabold tracking-normal text-nova-cream" onClick={() => onNavigate('landing')}>
          LinkNova
        </button>
        <div className="hidden items-center gap-9 text-lg text-nova-muted md:flex">
          <button type="button" className={view === 'dashboard' ? 'text-white' : 'hover:text-white'} onClick={() => onNavigate('dashboard')}>
            Dashboard
          </button>
          <button type="button" className={view === 'pricing' ? 'text-white' : 'hover:text-white'} onClick={() => onNavigate('pricing')}>
            Pricing
          </button>
          <button type="button" className={view === 'api' ? 'text-white' : 'hover:text-white'} onClick={() => onNavigate('api')}>
            API
          </button>
          {user ? (
            <button type="button" className="inline-flex items-center gap-2 hover:text-white" onClick={handleLogout}>
              <LogOut size={18} /> Logout
            </button>
          ) : (
            <button type="button" className="hover:text-white" onClick={() => onAuth('login')}>
              Login
            </button>
          )}
          <button type="button" className="nova-cream-button rounded-[18px] bg-nova-cream px-7 py-4 font-bold text-black" onClick={() => (user ? onNavigate('dashboard') : onAuth('signup'))}>
            Get Started
          </button>
        </div>
      </nav>
    </header>
  );
}

function Landing({ onSubmit, result, loading, error, onSignup }) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [copied, setCopied] = useState(false);
  const displayUrl = result?.shortUrl || '1nova.io/s/9xK2p';

  const submit = async (event) => {
    event.preventDefault();
    const created = await onSubmit({ originalUrl, customAlias });
    if (created) setOriginalUrl('');
  };

  const copy = async () => {
    await navigator.clipboard.writeText(displayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-10 h-[620px] w-[760px] -translate-x-1/2 rounded-full bg-white/[0.13] blur-[150px]" />
      <section className="relative mx-auto max-w-[1600px] px-6 pb-20 pt-44 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[1050px] text-center">
          <h1 className="text-[46px] font-extrabold leading-[1.05] tracking-normal text-white drop-shadow sm:text-[72px] lg:text-[86px]">
            Shorten, Share, Track — Instantly.
          </h1>
          <p className="mx-auto mt-7 max-w-[850px] text-[22px] leading-snug text-nova-muted sm:text-[25px]">
            Create clean short links, custom aliases, QR codes, and real-time analytics from one dashboard.
          </p>
        </div>

        <div className="mt-20 grid gap-10 lg:grid-cols-2">
          <div className="space-y-8">
            <form className="nova-panel p-10" onSubmit={submit}>
              <div className="mb-8 flex items-center gap-4">
                <span className="icon-tile">
                  <Link size={24} />
                </span>
                <h2 className="text-2xl font-extrabold">Create Short Link</h2>
              </div>
              <input
                className="nova-input"
                placeholder="Paste your long URL here..."
                value={originalUrl}
                onChange={(event) => setOriginalUrl(event.target.value)}
                required
              />
              <input
                className="nova-input mt-5"
                placeholder="Custom alias (optional)"
                value={customAlias}
                onChange={(event) => setCustomAlias(event.target.value)}
              />
              {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
              <button className="nova-cream-button mt-6 flex w-full items-center justify-center gap-3 rounded-[16px] bg-nova-cream px-8 py-5 text-xl font-extrabold text-black" disabled={loading}>
                <Sparkles size={24} />
                {loading ? 'Shortening...' : 'Shorten URL'}
              </button>
            </form>

            <div className="nova-panel flex items-center justify-between gap-8 p-10">
              <div className="min-w-0">
                <p className="mb-3 text-lg text-nova-muted">Your shortened link</p>
                <div className="flex items-center gap-4">
                  <code className="max-w-full rounded-[14px] border border-nova-line bg-white/[0.06] px-5 py-3 font-mono text-[26px] font-extrabold text-nova-cream shadow-inner">
                    {displayUrl.replace(/^https?:\/\//, '')}
                  </code>
                  <button type="button" className="nova-action rounded-[14px] border border-nova-line bg-white/[0.08] p-4 text-nova-cream" onClick={copy} aria-label="Copy link">
                    <Copy size={25} />
                  </button>
                </div>
                {copied ? <p className="mt-3 text-sm text-nova-green">Copied</p> : null}
              </div>
              <div className="hidden text-center sm:block">
                <QrCodeCard value={displayUrl} sizeClass="h-[122px] w-[122px]" />
                <p className="mt-3 text-sm text-nova-muted">QR Code</p>
              </div>
            </div>
          </div>

          <AnalyticsPreview />
        </div>
      </section>

      <section id="features" className="relative mx-auto grid max-w-[1280px] gap-8 px-6 pb-24 sm:px-10 md:grid-cols-3">
        <Feature icon={Zap} title="Fast Redirects" text="Lightning-fast global CDN ensures your links redirect in milliseconds from anywhere." />
        <Feature icon={BarChart3} title="Real-time Analytics" text="Track every click with detailed insights on location, device, referrer, and time." />
        <Feature icon={WandSparkles} title="Custom Aliases" text="Create branded, memorable short links with custom domains and personalized slugs." />
      </section>

      <section className="relative mx-auto max-w-[1050px] px-6 pb-24 text-center">
        <h2 className="text-4xl font-extrabold sm:text-6xl">Ready to make every link measurable?</h2>
        <button type="button" className="nova-cream-button mt-8 rounded-[18px] bg-nova-cream px-9 py-5 text-xl font-extrabold text-black" onClick={onSignup}>
          Get Started
        </button>
      </section>
    </div>
  );
}

function AnalyticsPreview() {
  return (
    <aside className="nova-panel p-10">
      <div className="mb-8 flex items-center gap-4">
        <span className="icon-tile">
          <BarChart3 size={26} />
        </span>
        <h2 className="text-2xl font-extrabold">Analytics Preview</h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Metric label="Total Clicks" value="24.8K" note="+12.5% this week" />
        <Metric label="Conversion" value="68%" note="+5.2% vs last month" />
      </div>

      <div className="nova-subcard mt-8 rounded-[18px] border border-nova-line bg-white/[0.10] p-5">
        <p className="text-lg text-nova-muted">Click Trend (7 days)</p>
        <svg className="mt-4 h-32 w-full" viewBox="0 0 640 130" fill="none" aria-hidden="true">
          <path d="M8 94 C86 76 128 70 202 82 C266 92 299 43 371 61 C452 82 470 60 548 45 C589 37 612 34 632 31" stroke="#e8ddd4" strokeWidth="4" />
          <path d="M8 100 C86 82 128 76 202 88 C266 98 299 49 371 67 C452 88 470 66 548 51 C589 43 612 40 632 37" stroke="rgba(255,255,255,0.24)" strokeWidth="2" />
        </svg>
      </div>

      <div className="mt-8">
        <p className="mb-4 text-lg text-nova-muted">Device Breakdown</p>
        <DeviceRow icon={<Smartphone size={19} />} value={52} />
        <DeviceRow icon={<Smartphone size={19} />} value={38} />
        <DeviceRow icon={<Smartphone size={19} />} value={10} />
      </div>
    </aside>
  );
}

function Metric({ label, value, note }) {
  return (
    <div className="nova-subcard rounded-[18px] border border-nova-line bg-white/[0.11] p-5">
      <p className="text-lg text-nova-muted">{label}</p>
      <strong className="mt-1 block text-4xl font-extrabold">{value}</strong>
      <span className="mt-2 block text-sm">{note}</span>
    </div>
  );
}

function DeviceRow({ icon, value }) {
  return (
    <div className="nova-device-row mb-4 grid grid-cols-[24px_1fr_42px] items-center gap-4">
      <span className="text-nova-muted">{icon}</span>
      <span className="h-3 rounded-full bg-white/[0.08]">
        <span className="block h-full rounded-full bg-nova-cream" style={{ width: `${value}%` }} />
      </span>
      <span className="text-lg">{value}%</span>
    </div>
  );
}

function PricingPage({ onSignup }) {
  const tiers = [
    { name: 'Starter', price: 'Free', detail: 'For students and personal portfolios', points: ['25 links', 'Basic analytics', 'Custom aliases'] },
    { name: 'Creator', price: '₹299/mo', detail: 'For creators and small campaigns', points: ['Unlimited links', 'QR codes', 'Expiry controls'] },
    { name: 'Business', price: '₹999/mo', detail: 'For teams and branded links', points: ['Team dashboard', 'API access', 'Custom domain support'] }
  ];

  return (
    <section className="mx-auto min-h-screen max-w-[1280px] px-6 pb-20 pt-36 sm:px-10">
      <div className="mb-10 max-w-3xl">
        <h1 className="text-5xl font-extrabold sm:text-6xl">Pricing</h1>
        <p className="mt-4 text-xl text-nova-muted">Start locally, scale when your links become real campaigns.</p>
      </div>
      <div className="grid gap-7 md:grid-cols-3">
        {tiers.map((tier) => (
          <article className="nova-panel p-8" key={tier.name}>
            <h2 className="text-3xl font-extrabold">{tier.name}</h2>
            <strong className="mt-5 block text-4xl text-nova-cream">{tier.price}</strong>
            <p className="mt-3 min-h-14 text-nova-muted">{tier.detail}</p>
            <div className="mt-7 space-y-3">
              {tier.points.map((point) => (
                <p className="rounded-[14px] border border-nova-line bg-white/[0.05] px-4 py-3 text-nova-muted" key={point}>
                  {point}
                </p>
              ))}
            </div>
            <button type="button" className="nova-cream-button mt-8 w-full rounded-[16px] bg-nova-cream px-6 py-4 font-extrabold text-black" onClick={onSignup}>
              Choose Plan
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function PlanPricingPage({ user, onSelectPlan }) {
  const tiers = [
    { id: 'free', name: 'Starter', price: 'Free', detail: 'For students and personal portfolios', points: ['5 saved links', 'Basic click counts', 'Standard short IDs'] },
    { id: 'creator', name: 'Creator', price: 'INR 299/mo', detail: 'For creators and small campaigns', points: ['1,000 links', 'Custom aliases', 'QR codes and expiry controls'] },
    { id: 'business', name: 'Business', price: 'INR 999/mo', detail: 'For teams and branded links', points: ['10,000 links', 'API access', 'Custom domain support'] }
  ];

  return (
    <section className="mx-auto min-h-screen max-w-[1280px] px-6 pb-20 pt-36 sm:px-10">
      <div className="mb-10 max-w-3xl">
        <h1 className="text-5xl font-extrabold sm:text-6xl">Pricing</h1>
        <p className="mt-4 text-xl text-nova-muted">Free users are limited. Upgrade to unlock campaign-ready link controls.</p>
      </div>
      <div className="grid gap-7 md:grid-cols-3">
        {tiers.map((tier) => (
          <article className="nova-panel p-8" key={tier.id}>
            <h2 className="text-3xl font-extrabold">{tier.name}</h2>
            <strong className="mt-5 block text-4xl text-nova-cream">{tier.price}</strong>
            <p className="mt-3 min-h-14 text-nova-muted">{tier.detail}</p>
            <div className="mt-7 space-y-3">
              {tier.points.map((point) => (
                <p className="rounded-[14px] border border-nova-line bg-white/[0.05] px-4 py-3 text-nova-muted" key={point}>
                  {point}
                </p>
              ))}
            </div>
            <button
              type="button"
              className="nova-cream-button mt-8 w-full rounded-[16px] bg-nova-cream px-6 py-4 font-extrabold text-black"
              onClick={() => onSelectPlan(tier.id === 'free' ? 'creator' : tier.id)}
            >
              {user?.plan === tier.id ? 'Current Plan' : tier.id === 'free' ? 'Upgrade for More' : 'Choose Plan'}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function BillingPage({ selectedPlan, onDone }) {
  const { user, upgradePlan, loading, error } = useAppStore();
  const [form, setForm] = useState({
    selectedPlan,
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    company: '',
    taxId: '',
    address: '',
    paymentReference: ''
  });

  const submit = async (event) => {
    event.preventDefault();
    const ok = await upgradePlan(form);
    if (ok) onDone();
  };

  return (
    <section className="mx-auto min-h-screen max-w-[980px] px-6 pb-20 pt-36 sm:px-10">
      <div className="mb-8">
        <h1 className="text-5xl font-extrabold">Billing Details</h1>
        <p className="mt-4 text-xl text-nova-muted">Complete these details to activate your selected local plan.</p>
      </div>
      <form className="nova-panel grid gap-5 p-8 md:grid-cols-2" onSubmit={submit}>
        <label className="text-nova-muted">
          Plan
          <select className="nova-input mt-2 !py-4" value={form.selectedPlan} onChange={(event) => setForm({ ...form, selectedPlan: event.target.value })}>
            <option value="creator">Creator - INR 299/mo</option>
            <option value="business">Business - INR 999/mo</option>
          </select>
        </label>
        <label className="text-nova-muted">
          Full name
          <input className="nova-input mt-2 !py-4" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required />
        </label>
        <label className="text-nova-muted">
          Email
          <input className="nova-input mt-2 !py-4" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        </label>
        <label className="text-nova-muted">
          Phone
          <input className="nova-input mt-2 !py-4" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
        </label>
        <label className="text-nova-muted">
          Company
          <input className="nova-input mt-2 !py-4" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} />
        </label>
        <label className="text-nova-muted">
          GST / Tax ID
          <input className="nova-input mt-2 !py-4" value={form.taxId} onChange={(event) => setForm({ ...form, taxId: event.target.value })} />
        </label>
        <label className="text-nova-muted md:col-span-2">
          Billing address
          <input className="nova-input mt-2 !py-4" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} required />
        </label>
        <div className="rounded-[18px] border border-nova-line bg-white/[0.05] p-5 text-nova-muted md:col-span-2">
          Payment integration is ready for the next step. Add your payment account or gateway details and this section can connect to real checkout.
        </div>
        <label className="text-nova-muted md:col-span-2">
          Payment reference
          <input className="nova-input mt-2 !py-4" placeholder="Transaction ID / note" value={form.paymentReference} onChange={(event) => setForm({ ...form, paymentReference: event.target.value })} required />
        </label>
        {error ? <p className="text-sm text-red-300 md:col-span-2">{error}</p> : null}
        <button className="nova-cream-button rounded-[16px] bg-nova-cream px-6 py-4 font-extrabold text-black md:col-span-2" disabled={loading}>
          {loading ? 'Activating...' : 'Activate Plan'}
        </button>
      </form>
    </section>
  );
}

function ApiPage() {
  return (
    <section className="mx-auto min-h-screen max-w-[1180px] px-6 pb-20 pt-36 sm:px-10">
      <div className="mb-10 max-w-3xl">
        <h1 className="text-5xl font-extrabold sm:text-6xl">API</h1>
        <p className="mt-4 text-xl text-nova-muted">Use LinkNova from your own tools once API keys are enabled in the next phase.</p>
      </div>
      <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="nova-panel p-8">
          <span className="icon-tile mb-6">
            <Link size={24} />
          </span>
          <h2 className="text-3xl font-extrabold">Create Short URL</h2>
          <p className="mt-4 text-lg leading-relaxed text-nova-muted">The current local API already supports authenticated URL creation, expiry, analytics, updates, deletes, and redirects.</p>
        </article>
        <pre className="nova-panel overflow-auto p-8 text-sm leading-relaxed text-nova-cream">
{`POST http://localhost:5000/api/url
Content-Type: application/json

{
  "originalUrl": "https://example.com/campaign",
  "customAlias": "launch",
  "expiryDate": "2026-12-31"
}`}
        </pre>
      </div>
    </section>
  );
}

function Feature({ icon: Icon, title, text }) {
  return (
    <article className="nova-panel min-h-[330px] p-10">
      <span className="icon-tile mb-9">
        <Icon size={31} />
      </span>
      <h3 className="text-2xl font-extrabold">{title}</h3>
      <p className="mt-5 text-xl leading-relaxed text-nova-muted">{text}</p>
    </article>
  );
}

function QrCodeCard({ value, sizeClass = 'h-[132px] w-[132px]' }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value || 'https://1nova.io', {
      margin: 1,
      width: 220,
      color: {
        dark: '#050505',
        light: '#e8ddd4'
      }
    }).then((dataUrl) => {
      if (active) setSrc(dataUrl);
    });

    return () => {
      active = false;
    };
  }, [value]);

  return (
    <div className={`${sizeClass} overflow-hidden rounded-[18px] bg-nova-cream p-2`}>
      {src ? <img className="h-full w-full rounded-[12px]" src={src} alt="Short link QR code" /> : null}
    </div>
  );
}

function formatExpiry(expiryDate) {
  if (!expiryDate) return 'No expiry';
  const date = new Date(expiryDate);
  if (Number.isNaN(date.getTime())) return 'No expiry';
  const expired = date < new Date();
  return `${expired ? 'Expired' : 'Expires'} ${date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })}`;
}

function AuthPage({ mode, setMode, onDone }) {
  const { login, register, googleLogin, loading, error } = useAppStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const submit = async (event) => {
    event.preventDefault();
    const ok = mode === 'login' ? await login(form) : await register(form);
    if (ok) onDone();
  };

  return (
    <section className="mx-auto flex min-h-screen max-w-[560px] items-center px-6 pt-24">
      <form className="nova-panel w-full p-10" onSubmit={submit}>
        <span className="icon-tile mb-7">
          <Link size={24} />
        </span>
        <h1 className="text-4xl font-extrabold">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="mt-3 text-lg text-nova-muted">Manage links, aliases, expiry, and analytics from LinkNova.</p>
        {mode === 'signup' ? (
          <input className="nova-input mt-8" placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        ) : null}
        <input className="nova-input mt-5" type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        <input className="nova-input mt-5" type="password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
        <button className="nova-cream-button mt-6 w-full rounded-[16px] bg-nova-cream px-8 py-5 text-xl font-extrabold text-black">
          {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Get Started'}
        </button>
        <button className="nova-action mt-4 w-full rounded-[16px] border border-nova-line px-8 py-4 font-bold text-nova-cream" type="button" onClick={googleLogin}>
          Continue with Google
        </button>
        <button className="mt-5 text-nova-muted hover:text-white" type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Login'}
        </button>
      </form>
    </section>
  );
}

function Dashboard({ urls, user, onNavigate }) {
  const { createUrl, deleteUrl, updateUrl, loading, error, clearError } = useAppStore();
  const totalClicks = useMemo(() => urls.reduce((sum, url) => sum + (url.clicks || 0), 0), [urls]);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ originalUrl: '', expiryDate: '', isActive: true });
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ originalUrl: '', customAlias: '', expiryDate: '' });
  const [createdUrl, setCreatedUrl] = useState(null);
  const [copiedUrlId, setCopiedUrlId] = useState('');
  const limits = user?.limits || { maxLinks: 5, customAlias: false, expiry: false, qrCode: false };

  const startEdit = (url) => {
    setEditingId(url._id);
    setDraft({
      originalUrl: url.originalUrl,
      expiryDate: url.expiryDate ? new Date(url.expiryDate).toISOString().slice(0, 10) : '',
      isActive: url.isActive
    });
  };

  const saveEdit = async (id) => {
    await updateUrl(id, {
      originalUrl: draft.originalUrl,
      expiryDate: draft.expiryDate || null,
      isActive: draft.isActive
    });
    setEditingId(null);
  };

  const submitCreate = async (event) => {
    event.preventDefault();
    const created = await createUrl({
      originalUrl: createForm.originalUrl,
      customAlias: createForm.customAlias,
      expiryDate: createForm.expiryDate || undefined
    });

    if (created) {
      setCreateForm({ originalUrl: '', customAlias: '', expiryDate: '' });
      setCreatedUrl(created);
    }
  };

  const copyShortUrl = async (url) => {
    await navigator.clipboard.writeText(url.shortUrl);
    setCopiedUrlId(url._id);
    setTimeout(() => setCopiedUrlId(''), 1400);
  };

  const openCreate = () => {
    clearError();
    setCreatedUrl(null);
    setShowCreate(true);
    window.setTimeout(() => document.getElementById('create-link-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  return (
    <section id="dashboard" className="mx-auto max-w-[1440px] px-6 pb-20 pt-36 sm:px-10 lg:px-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-5xl font-extrabold">Dashboard</h1>
          <p className="mt-3 text-xl text-nova-muted">
            {user?.plan ? `${user.plan.toUpperCase()} plan - ${urls.length}/${limits.maxLinks} links used` : 'Your link command center.'}
          </p>
        </div>
        <button
          type="button"
          className="nova-cream-button rounded-[18px] bg-nova-cream px-7 py-4 font-extrabold text-black"
          onClick={() => {
            clearError();
            setCreatedUrl(null);
            setShowCreate((value) => !value);
          }}
        >
          Create Link
        </button>
      </div>

      {showCreate ? (
        <form id="create-link-panel" className="nova-panel mb-8 grid gap-4 p-7 lg:grid-cols-[1fr_220px_210px_170px]" onSubmit={submitCreate}>
          <input
            className="nova-input !py-4"
            placeholder="Paste your long URL..."
            value={createForm.originalUrl}
            onChange={(event) => setCreateForm({ ...createForm, originalUrl: event.target.value })}
            required
          />
          <input
            className="nova-input !py-4"
            placeholder="Custom alias"
            value={createForm.customAlias}
            onChange={(event) => setCreateForm({ ...createForm, customAlias: event.target.value })}
            disabled={!limits.customAlias}
          />
          <input
            className="nova-input !py-4"
            type="date"
            value={createForm.expiryDate}
            onChange={(event) => setCreateForm({ ...createForm, expiryDate: event.target.value })}
            disabled={!limits.expiry}
          />
          <button className="nova-cream-button rounded-[16px] bg-nova-cream px-6 py-4 font-extrabold text-black" disabled={loading}>
            {loading ? 'Creating...' : 'Shorten URL'}
          </button>
          {error ? <p className="lg:col-span-4 text-sm text-red-300">{error}</p> : null}
          {(!limits.customAlias || !limits.expiry) ? (
            <div className="lg:col-span-4 rounded-[16px] border border-nova-line bg-white/[0.05] p-4 text-nova-muted">
              Free plan supports basic short links only. Upgrade to Creator for custom aliases, QR codes, and expiry controls.
              <button type="button" className="ml-3 font-bold text-nova-cream" onClick={() => onNavigate('pricing')}>
                View plans
              </button>
            </div>
          ) : null}
        </form>
      ) : null}

      {createdUrl ? (
        <div className="nova-panel mb-8 flex flex-wrap items-center justify-between gap-5 p-7">
          <div className="min-w-0 flex-1">
            <p className="text-sm uppercase tracking-[0.12em] text-nova-muted">Short link created</p>
            <code className="mt-2 block truncate font-mono text-2xl font-extrabold text-nova-cream">{createdUrl.shortUrl}</code>
            <p className="mt-3 text-nova-muted">{formatExpiry(createdUrl.expiryDate)}</p>
          </div>
          {limits.qrCode ? (
            <div className="text-center">
              <QrCodeCard value={createdUrl.shortUrl} />
              <p className="mt-2 text-sm text-nova-muted">QR Code</p>
            </div>
          ) : (
            <div className="max-w-[170px] rounded-[18px] border border-nova-line bg-white/[0.05] p-4 text-sm text-nova-muted">
              QR codes unlock on Creator.
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" className="nova-action rounded-[14px] border border-nova-line p-4 text-nova-cream" onClick={() => copyShortUrl(createdUrl)} aria-label="Copy short URL">
              <Copy size={21} />
            </button>
            <a className="nova-action rounded-[14px] border border-nova-line p-4 text-nova-cream" href={createdUrl.shortUrl} target="_blank" rel="noreferrer" aria-label="Open short URL">
              <ExternalLink size={21} />
            </a>
          </div>
          {copiedUrlId === createdUrl._id ? <p className="w-full text-sm text-nova-green">Copied</p> : null}
        </div>
      ) : null}

      <div id="dashboard-stats" className="grid scroll-mt-28 gap-6 md:grid-cols-3">
        <Stat icon={MousePointerClick} label="Total Clicks" value={totalClicks.toLocaleString()} />
        <Stat icon={Link} label="Active Links" value={urls.filter((url) => url.isActive).length} />
        <Stat icon={Timer} label="Avg Response" value="<200ms" />
      </div>

      <div className="nova-panel mt-8 overflow-hidden">
        <div className="grid grid-cols-[1.2fr_0.9fr_120px_120px] gap-4 border-b border-nova-line px-7 py-5 text-sm uppercase tracking-[0.12em] text-nova-muted max-lg:hidden">
          <span>Original URL</span>
          <span>Short URL</span>
          <span>Clicks</span>
          <span>Actions</span>
        </div>
        {urls.length === 0 ? (
          <div className="px-7 py-12 text-center">
            <p className="text-xl font-bold">No links yet</p>
            <p className="mt-2 text-nova-muted">Create your first short link from this dashboard.</p>
          </div>
        ) : null}
        {urls.map((url) => (
          <div key={url._id} className="nova-row border-b border-white/[0.06] px-7 py-5 last:border-0">
            <div className="grid items-center gap-4 lg:grid-cols-[1.2fr_0.9fr_120px_120px]">
              <div className="min-w-0">
                <a className="block truncate text-nova-muted hover:text-white" href={url.originalUrl} target="_blank" rel="noreferrer">
                  {url.originalUrl}
                </a>
                <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${url.isActive ? 'bg-nova-green/15 text-nova-green' : 'bg-white/10 text-nova-muted'}`}>
                  {url.isActive ? 'Active' : 'Disabled'}
                </span>
                <span className="ml-2 mt-2 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-nova-muted">
                  {formatExpiry(url.expiryDate)}
                </span>
              </div>
              <code className="truncate font-mono text-nova-cream">{url.shortUrl}</code>
              <strong>{(url.clicks || 0).toLocaleString()}</strong>
              <div className="flex gap-2">
                <button type="button" className="nova-action rounded-xl border border-nova-line p-3" aria-label="Copy short URL" onClick={() => copyShortUrl(url)}>
                  <Copy size={18} />
                </button>
                <button type="button" className="nova-action rounded-xl border border-nova-line p-3" aria-label="Edit link" onClick={() => startEdit(url)}>
                  <Pencil size={18} />
                </button>
                <button type="button" className="nova-action rounded-xl border border-nova-line p-3" aria-label="Delete link" onClick={() => deleteUrl(url._id)}>
                  <Trash2 size={18} />
                </button>
                <a className="nova-action rounded-xl border border-nova-line p-3" href={url.shortUrl} target="_blank" rel="noreferrer" aria-label="Open link">
                  <ExternalLink size={18} />
                </a>
              </div>
            </div>
            {editingId === url._id ? (
              <div className="mt-5 grid gap-4 rounded-[18px] border border-nova-line bg-white/[0.05] p-5 lg:grid-cols-[1fr_210px_150px_180px]">
                <input className="nova-input !py-4" value={draft.originalUrl} onChange={(event) => setDraft({ ...draft, originalUrl: event.target.value })} />
                <input className="nova-input !py-4" type="date" value={draft.expiryDate} onChange={(event) => setDraft({ ...draft, expiryDate: event.target.value })} />
                <label className="flex items-center gap-3 text-nova-muted">
                  <input className="h-5 w-5 accent-[#e8ddd4]" type="checkbox" checked={draft.isActive} onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })} />
                  Enabled
                </label>
                <div className="flex gap-3">
                  <button type="button" className="nova-cream-button rounded-[14px] bg-nova-cream px-5 py-3 font-extrabold text-black" onClick={() => saveEdit(url._id)}>
                    Save
                  </button>
                  <button type="button" className="rounded-[14px] border border-nova-line px-5 py-3 font-bold text-nova-muted" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <DashboardFooter onNavigate={onNavigate} onCreateLink={openCreate} />
    </section>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="nova-panel p-7">
      <span className="icon-tile mb-5">
        <Icon size={24} />
      </span>
      <p className="text-nova-muted">{label}</p>
      <strong className="mt-2 block text-4xl">{value}</strong>
    </div>
  );
}

function DashboardFooter({ onNavigate, onCreateLink }) {
  const features = ['Link Shortener', 'QR Code Generator', 'Advanced Analytics', 'Custom Domains', 'Campaign Management'];
  const security = ['Google Safe Browsing', 'Virus Total Protection', 'Norton Safe Web', 'SSL Encryption'];
  const legal = ['Terms of Use', 'Privacy Policy', 'Cookie Policy'];
  const handleFeature = (item) => {
    if (item === 'Link Shortener' || item === 'QR Code Generator') {
      onCreateLink();
      return;
    }

    if (item === 'Advanced Analytics') {
      document.getElementById('dashboard-stats')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (item === 'Custom Domains') {
      onNavigate('api');
      return;
    }

    onNavigate('pricing');
  };

  const handleLegal = (item) => {
    window.alert(`${item} content will be added before public launch.`);
  };

  return (
    <footer className="mt-14 border-t border-nova-line bg-[#070707] px-6 py-14 text-nova-muted sm:px-10">
      <div className="mx-auto grid max-w-[1180px] gap-10 md:grid-cols-[1.3fr_1fr_1fr_1.25fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] bg-nova-cream text-black shadow-lg shadow-black/40">
              <Link size={20} />
            </span>
            <strong className="text-2xl text-nova-cream">LinkNova.app</strong>
          </div>
          <p className="mt-7 max-w-[330px] leading-relaxed">
            Efficient, secure and accessible URL shortening service. We transform long links into short and powerful experiences.
          </p>
        </div>

        <FooterList title="Features" items={features} onSelect={handleFeature} />

        <div>
          <h3 className="text-xl font-extrabold text-white">Security</h3>
          <div className="mt-7 space-y-5">
            {security.map((item) => (
              <p className="flex items-center gap-3" key={item}>
              <ShieldCheck size={17} className="text-nova-green" />
              {item}
            </p>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-white">Contact & Legal</h3>
          <div className="mt-7 space-y-5">
            <p className="flex gap-3">
              <MapPin size={18} className="mt-1 shrink-0 text-nova-cream" />
              1105 LinkNova Street, Bengaluru, KA
            </p>
            <p className="flex items-center gap-3">
              <Mail size={18} className="text-nova-cream" />
              support@linknova.app
            </p>
          </div>
          <div className="mt-9 space-y-5">
            {legal.map((item) => (
              <button type="button" className="block hover:text-nova-cream" key={item} onClick={() => handleLegal(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-[1180px] flex-wrap items-center justify-between gap-5 border-t border-nova-line pt-8">
        <p>
          © 2026 <span className="font-bold text-nova-cream">LinkNova.app</span>. All rights reserved.
        </p>
        <div className="flex flex-wrap gap-8">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-nova-green" />
            System Operational
          </span>
          <span className="inline-flex items-center gap-2">
            <Timer size={16} />
            27ms response
          </span>
          <span className="inline-flex items-center gap-2">
            <ShieldCheck size={16} />
            99.99% uptime
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterList({ title, items, onSelect }) {
  return (
    <div>
      <h3 className="text-xl font-extrabold text-white">{title}</h3>
      <div className="mt-7 space-y-5">
        {items.map((item) => (
          <button type="button" className="block hover:text-nova-cream" key={item} onClick={() => onSelect(item)}>
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function SetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const token = new URLSearchParams(window.location.search).get('token');

  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      return;
    }

    const validate = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/auth/setup-password?token=${encodeURIComponent(token)}`
        );
        const data = await res.json();
        if (res.ok && data.valid) {
          setTokenValid(true);
          setUserName(data.firstName || '');
          setUserEmail(data.email || '');
        }
      } catch {
        // token invalid / network error — stay on invalid state
      } finally {
        setIsValidating(false);
      }
    };

    validate();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/setup-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setUserEmail(data.email || userEmail);
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to set password. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password strength score 0-5
  const strength = (() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength] ?? '';
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'][strength] ?? '';

  const spinnerStyle: React.CSSProperties = {
    width: '2rem',
    height: '2rem',
    border: '2px solid rgba(255,255,255,0.2)',
    borderTop: '2px solid #60a5fa',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };

  const pageBg: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(to bottom right, #0f172a, #1e3a8a, #0f172a)',
    padding: '2rem',
  };

  const cardStyle: React.CSSProperties = {
    maxWidth: '28rem',
    width: '100%',
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    borderRadius: '1rem',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '2rem',
  };

  // ── Validating spinner ──────────────────────────────────────────────────
  if (isValidating) {
    return (
      <>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } body { margin:0;padding:0; }`}</style>
        <div style={pageBg}>
          <div style={spinnerStyle} />
        </div>
      </>
    );
  }

  // ── Invalid / expired token ─────────────────────────────────────────────
  if (!token || !tokenValid) {
    return (
      <>
        <style>{`body { margin:0;padding:0; }`}</style>
        <div style={pageBg}>
          <div style={cardStyle}>
            <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <AlertCircle style={{ width: '2rem', height: '2rem', color: '#f87171' }} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white', marginBottom: '0.75rem' }}>
              Link Expired
            </h1>
            <p style={{ color: '#bfdbfe', marginBottom: '2rem', lineHeight: 1.6 }}>
              This password setup link is no longer valid. Please contact your administrator to receive a new invitation.
            </p>
            <a
              href="/"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'linear-gradient(to right, #3b82f6, #a855f7)', color: 'white', fontWeight: 600, borderRadius: '0.75rem', textDecoration: 'none' }}
            >
              Go to Sign In
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </>
    );
  }

  // ── Success screen ──────────────────────────────────────────────────────
  if (success) {
    return (
      <>
        <style>{`body { margin:0;padding:0; }`}</style>
        <div style={pageBg}>
          <div style={cardStyle}>
            <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle style={{ width: '2rem', height: '2rem', color: '#6ee7b7' }} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white', marginBottom: '0.75rem' }}>
              Password Set Successfully
            </h1>
            <p style={{ color: '#bfdbfe', marginBottom: '0.5rem', lineHeight: 1.6 }}>
              Your account is ready. Sign in with:
            </p>
            <p style={{ color: '#e0e7ff', fontWeight: 500, marginBottom: '2rem' }}>{userEmail}</p>
            <a
              href="/"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', background: 'linear-gradient(to right, #3b82f6, #a855f7)', color: 'white', fontWeight: 600, borderRadius: '0.75rem', textDecoration: 'none' }}
            >
              Go to Sign In
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.875rem 3rem',
    borderRadius: '0.75rem',
    border: '3px solid rgba(96,165,250,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const iconBtnStyle: React.CSSProperties = {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#93c5fd',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        body { margin: 0; padding: 0; }
        input::placeholder { color: rgba(147,197,253,0.6); }
        input:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.2) !important;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #0f172a, #1e3a8a, #0f172a)',
        padding: '2rem',
      }}>
        <div style={{ display: 'flex', width: '100%', maxWidth: '80rem', gap: '2rem', alignItems: 'center' }}>

          {/* ── Left: form ──────────────────────────────────────────────── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

            {/* Logo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'white', margin: '0 0 0.5rem', letterSpacing: '-0.025em', lineHeight: 1 }}>
                Activate
                <span style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Swag
                </span>
              </h1>
              <p style={{ color: '#93c5fd', fontSize: '1rem', margin: 0 }}>Command Center</p>
            </div>

            {/* Card */}
            <div style={{ width: '100%', maxWidth: '28rem', backgroundColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', margin: '0 0 0.5rem' }}>
                Create your account
              </h2>
              <p style={{ color: '#bfdbfe', fontSize: '0.95rem', margin: '0 0 1.5rem' }}>
                {userName ? `${userName}, s` : 'S'}et your password to continue
                {userEmail ? ` with ${userEmail}` : ''}
              </p>

              {error && (
                <div style={{ padding: '0.875rem', borderRadius: '0.75rem', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(220,38,38,0.4)', marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.8rem', color: '#fca5a5', margin: 0 }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Password field */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#93c5fd' }} size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create your password"
                      required
                      minLength={8}
                      style={inputStyle}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={iconBtnStyle}>
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {password.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.375rem' }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            style={{
                              height: '0.25rem',
                              flex: 1,
                              borderRadius: '9999px',
                              backgroundColor: i <= strength ? strengthColor : 'rgba(148,163,184,0.4)',
                              transition: 'background-color 0.3s',
                            }}
                          />
                        ))}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: strengthColor, margin: 0 }}>{strengthLabel}</p>
                    </div>
                  )}
                </div>

                {/* Confirm password field */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#93c5fd' }} size={20} />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      minLength={8}
                      style={inputStyle}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={iconBtnStyle}>
                      {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && password !== confirmPassword && (
                    <p style={{ fontSize: '0.75rem', color: '#fca5a5', margin: '0.375rem 0 0' }}>
                      Passwords do not match
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting || password.length < 8 || password !== confirmPassword}
                  style={{
                    width: '100%',
                    padding: '1rem 1.5rem',
                    background: 'linear-gradient(to right, #3b82f6, #a855f7)',
                    color: 'white',
                    fontWeight: 700,
                    borderRadius: '0.75rem',
                    border: 'none',
                    cursor: isSubmitting || password.length < 8 || password !== confirmPassword ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 10px 15px -3px rgba(59,130,246,0.3)',
                    fontSize: '1rem',
                    opacity: isSubmitting || password.length < 8 || password !== confirmPassword ? 0.5 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {isSubmitting ? (
                    <div style={{ width: '1.25rem', height: '1.25rem', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '9999px', animation: 'spin 0.6s linear infinite' }} />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </div>

            <p style={{ textAlign: 'center', color: 'rgba(147,197,253,0.5)', fontSize: '0.75rem', margin: '2rem 0 0' }}>
              © {new Date().getFullYear()} ActivateSwag. All rights reserved.
            </p>
          </div>

          {/* ── Right: feature highlights (hidden on small screens via flex-1) ── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ maxWidth: '32rem' }}>
              <h2 style={{ fontSize: '3rem', fontWeight: 900, color: 'white', marginBottom: '1.5rem', lineHeight: 1.2 }}>
                Manage Your<br />
                <span style={{ background: 'linear-gradient(to right, #60a5fa, #a855f7)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Product Pipeline
                </span>
              </h2>
              <p style={{ fontSize: '1.2rem', color: '#bfdbfe', marginBottom: '3rem', lineHeight: 1.6 }}>
                Track products, manage vendors, and streamline your entire product lifecycle in one powerful platform.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { icon: '📦', title: 'Product Management', desc: 'Track your entire product pipeline' },
                  { icon: '🏢', title: 'Vendor Relations', desc: 'Manage all your supplier connections' },
                  { icon: '📊', title: 'Analytics Dashboard', desc: 'Real-time insights and reporting' },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <div style={{ fontSize: '1.875rem' }}>{feature.icon}</div>
                    <div>
                      <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '0.25rem', margin: '0 0 0.25rem' }}>{feature.title}</h3>
                      <p style={{ color: '#bfdbfe', fontSize: '0.875rem', margin: 0 }}>{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

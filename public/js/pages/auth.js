/* ==========================================================================
   Auth page controller (Login & Register)
   ========================================================================== */

(function (BFV) {
  'use strict';

  const { post, state } = BFV;

  async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const origText = btn ? btn.innerHTML : 'Sign In';

    const email = (form.email.value || '').trim();
    const password = form.password.value || '';

    if (!email || !password) {
      return window.Site.toastErr('Please provide both email and password.');
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = 'Signing in…';
    }

    try {
      const res = await post('/auth/login', { email, password });
      window.Site.toastOk(res.message || 'Signed in successfully.');
      state.user = res.user;
      window.Site.syncBadges();

      const redirect = BFV.query.get('redirect') || (res.user.role === 'admin' ? '/admin' : '/account');
      window.setTimeout(() => {
        window.location.href = redirect;
      }, 500);
    } catch (err) {
      window.Site.toastErr(err.message || 'Invalid email or password.');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origText;
      }
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const origText = btn ? btn.innerHTML : 'Create Account';

    const name = (form.name.value || '').trim();
    const email = (form.email.value || '').trim();
    const phone = (form.phone.value || '').trim();
    const password = form.password.value || '';

    if (!name) return window.Site.toastErr('Please enter your full name.');
    if (!email || !email.includes('@')) return window.Site.toastErr('Please enter a valid email address.');
    if (!phone) return window.Site.toastErr('Please enter your phone number.');
    if (!password || password.length < 6) return window.Site.toastErr('Password must be at least 6 characters.');

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = 'Creating account…';
    }

    try {
      const res = await post('/auth/register', { name, email, phone, password });
      window.Site.toastOk(res.message || 'Account created successfully!');
      state.user = res.user;
      window.Site.syncBadges();

      const redirect = BFV.query.get('redirect') || '/account';
      window.setTimeout(() => {
        window.location.href = redirect;
      }, 500);
    } catch (err) {
      window.Site.toastErr(err.message || 'Could not register account.');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origText;
      }
    }
  }

  async function init() {
    /* If already logged in, redirect unless explicitly viewing or changing */
    const redirect = BFV.query.get('redirect');
    if (state.user && !redirect) {
      const target = state.user.role === 'admin' ? '/admin' : '/account';
      window.location.href = target;
      return;
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const registerForm = document.getElementById('registerForm');
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
  }

  window.BFVPages = window.BFVPages || {};
  window.BFVPages.auth = init;
  window.BFVPages.login = init;
  window.BFVPages.register = init;
})(window.BFV);

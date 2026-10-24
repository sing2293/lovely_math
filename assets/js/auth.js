/* Lovely Math — the garden gate: one sign-in unlocks the whole site.
   The site's content and worked solutions are AES-GCM encrypted per language (tools/seal-site.mjs).
   The key is derived in the browser from the name and password (PBKDF2-SHA256), so
   nothing readable sits in the page source until the right person signs in. */
(function () {
  'use strict';
  const S = window.LOVELY_SEALED;
  const t = (k, v) => (window.LovelyI18n ? window.LovelyI18n.t(k, v) : k);
  const lang = window.LovelyI18n ? window.LovelyI18n.lang : 'en';
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  // Forgiving input: the name ignores case and outer spaces; the password ignores case and all spaces.
  const secretOf = (name, pw) => String(name || '').trim().toLowerCase() + ':' + String(pw || '').toLowerCase().replace(/\s+/g, '');
  const SIGNED_IN = 'lm:gate'; // kept in localStorage: one user, signed in until "Log out"
  const pack = () => (S && S.langs && (S.langs[lang] || S.langs.en)) || null;
  let key = null;

  async function derive(secret) {
    const base = await crypto.subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: fromB64(S.salt), iterations: S.iter, hash: 'SHA-256' },
      base,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
  }
  async function open(k, box) {
    return dec.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(box.iv) }, k, fromB64(box.ct)));
  }
  async function unlock(secret) {
    try {
      const k = await derive(secret);
      if ((await open(k, S.check)) !== 'lovely-math-ok') return null;
      const content = JSON.parse(await open(k, pack().content));
      key = k;
      return content;
    } catch (e) {
      return null; // wrong name or password: AES-GCM authentication fails
    }
  }

  // The test room reads solutions through this (current language first, English as a fallback).
  window.LovelyVault = {
    available: () => !!(S && S.langs && window.crypto && window.crypto.subtle),
    isOpen: () => !!key,
    async reveal(id) {
      if (!key) throw new Error('locked');
      const box = (pack().items || {})[id] || (S.langs.en.items || {})[id];
      return box ? open(key, box) : null;
    }
  };

  const saved = {
    get() { try { return localStorage.getItem(SIGNED_IN); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(SIGNED_IN, v); } catch (e) { /* private mode: sign in each visit */ } },
    clear() { try { localStorage.removeItem(SIGNED_IN); } catch (e) { /* ignore */ } }
  };
  const nameOf = (secret) => { const n = secret.split(':')[0]; return n.charAt(0).toLocaleUpperCase() + n.slice(1); };

  function enter(content, secret) {
    const name = nameOf(secret);
    const start = () => window.LovelyApp.start(content, { name });
    document.body.classList.remove('locked');
    const gate = document.getElementById('gate');
    gate.classList.add('opening');
    setTimeout(() => { gate.hidden = true; }, 650);
    const who = document.getElementById('who');
    who.querySelector('.who-name').textContent = name + ' ♡';
    who.hidden = false;
    // app.js loads after this script; wait for it if a remembered sign-in finished first
    if (window.LovelyApp) start();
    else document.addEventListener('DOMContentLoaded', start, { once: true });
  }

  async function boot() {
    const form = document.getElementById('gate-form');
    const nameIn = document.getElementById('gate-name');
    const pwIn = document.getElementById('gate-pw');
    const go = document.getElementById('gate-go');
    const msg = document.getElementById('gate-msg');
    document.getElementById('logout').addEventListener('click', () => {
      saved.clear();
      location.reload();
    });
    if (!window.LovelyVault.available()) {
      msg.textContent = t('gate.nocrypto');
      go.disabled = true;
      return;
    }
    const remembered = saved.get();
    if (remembered) {
      msg.textContent = t('gate.welcome');
      const content = await unlock(remembered);
      if (content) return enter(content, remembered);
      saved.clear(); // the site was re-sealed with new details
      msg.textContent = '';
    }
    setTimeout(() => nameIn.focus(), 60);
    let wrong = 0;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!nameIn.value.trim() || !pwIn.value) { msg.textContent = t('gate.both'); return; }
      go.disabled = true;
      msg.textContent = t('gate.opening');
      const secret = secretOf(nameIn.value, pwIn.value);
      const content = await unlock(secret);
      go.disabled = false;
      if (content) {
        saved.set(secret);
        msg.textContent = '';
        enter(content, secret);
      } else {
        msg.textContent = t('gate.wrong' + ((wrong++ % 3) + 1));
        form.classList.remove('shake');
        void form.offsetWidth;
        form.classList.add('shake');
        pwIn.select();
      }
    });
  }
  boot();
})();

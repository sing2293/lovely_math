/* Lovely Math — the garden gate: one sign-in unlocks the whole site.
   The site's content and worked solutions are AES-GCM encrypted per language (tools/seal-site.mjs).
   The key is derived in the browser from the name and password (PBKDF2-SHA256), so
   nothing readable sits in the page source until the right person signs in. */
(function () {
  'use strict';
  const S = window.LOVELY_SEALED;
  const t = (k, v) => (window.LovelyI18n ? window.LovelyI18n.t(k, v) : k);
  const lang = () => (window.LovelyI18n ? window.LovelyI18n.lang : 'en');
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const toB64 = (buf) => btoa(String.fromCharCode.apply(null, new Uint8Array(buf)));
  // Forgiving input: the name ignores case and outer spaces; the password ignores case and all spaces.
  const secretOf = (name, pw) => String(name || '').trim().toLowerCase() + ':' + String(pw || '').toLowerCase().replace(/\s+/g, '');
  const SIGNED_IN = 'lm:gate'; // one user, signed in until "Log out"
  const KEY_CACHE = 'lm:gatekey'; // the derived key for this sealing, so return visits skip the slow PBKDF2 step
  const pack = () => (S && S.langs && (S.langs[lang()] || S.langs.en)) || null;
  let key = null;

  async function derive(secret) {
    const base = await crypto.subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: fromB64(S.salt), iterations: S.iter, hash: 'SHA-256' },
      base,
      { name: 'AES-GCM', length: 256 },
      true, // extractable, so it can be cached for this device
      ['decrypt']
    );
  }
  async function open(k, box) {
    return dec.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(box.iv) }, k, fromB64(box.ct)));
  }
  async function useKey(k) {
    if ((await open(k, S.check)) !== 'lovely-math-ok') return null;
    const content = JSON.parse(await open(k, pack().content));
    key = k;
    return content;
  }
  async function unlock(secret) {
    try { return await useKey(await derive(secret)); } catch (e) { return null; } // wrong details fail AES-GCM authentication
  }
  async function unlockCached() {
    try {
      const c = JSON.parse(localStorage.getItem(KEY_CACHE) || 'null');
      if (!c || c.salt !== S.salt) return null; // missing, or the site was re-sealed since
      return await useKey(await crypto.subtle.importKey('raw', fromB64(c.key), 'AES-GCM', false, ['decrypt']));
    } catch (e) {
      return null;
    }
  }
  async function cacheKey() {
    try { localStorage.setItem(KEY_CACHE, JSON.stringify({ salt: S.salt, key: toB64(await crypto.subtle.exportKey('raw', key)) })); } catch (e) { /* private mode */ }
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

  // A language switch while signed in: decrypt that language and re-render in place.
  window.addEventListener('lovely:lang', async () => {
    if (!key || !window.LovelyApp) return;
    try { window.LovelyApp.restart(JSON.parse(await open(key, pack().content))); } catch (e) { /* keep the current language */ }
  });

  const saved = {
    get() { try { return localStorage.getItem(SIGNED_IN); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(SIGNED_IN, v); } catch (e) { /* private mode: sign in each visit */ } },
    clear() { try { localStorage.removeItem(SIGNED_IN); localStorage.removeItem(KEY_CACHE); } catch (e) { /* ignore */ } }
  };
  const nameOf = (secret) => { const n = secret.split(':')[0]; return n.charAt(0).toLocaleUpperCase() + n.slice(1); };

  function enter(content, secret) {
    const name = nameOf(secret);
    const start = () => window.LovelyApp.start(content, { name });
    document.body.classList.remove('locked');
    document.documentElement.classList.remove('restoring');
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

  function showForm() {
    document.documentElement.classList.remove('restoring'); // the head script hid the form for remembered visits
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
      showForm();
      msg.textContent = t('gate.nocrypto');
      go.disabled = true;
      return;
    }
    const remembered = saved.get();
    if (remembered) {
      let content = await unlockCached();
      if (!content) {
        content = await unlock(remembered);
        if (content) cacheKey();
      }
      if (content) return enter(content, remembered);
      saved.clear(); // the site was re-sealed with new details
    }
    showForm();
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
        cacheKey();
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

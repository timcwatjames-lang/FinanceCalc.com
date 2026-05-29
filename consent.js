/* ---- Cookie Consent Banner (GDPR + CCPA) ---- */

(function() {
  const CONSENT_KEY = 'financecalc_consent';
  const CONSENT_VERSION = 1;

  function getConsent() {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setConsent(choice) {
    const data = {
      version: CONSENT_VERSION,
      timestamp: Date.now(),
      ...choice
    };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
    } catch (e) {}
    applyConsent(choice);
    hideBanner();
  }

  function applyConsent(choice) {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        ad_storage: choice.ad_storage || 'denied',
        ad_user_data: choice.ad_user_data || 'denied',
        ad_personalization: choice.ad_personalization || 'denied',
        analytics_storage: choice.analytics_storage || 'denied'
      });
    }
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({
      google_ad_client: 'ca-pub-5862355594319303',
      enable_page_level_ads: true,
      ...(choice.ad_storage === 'granted' ? {} : { non_personalized_ads: true })
    });
  }

  function showBanner() {
    const existing = document.getElementById('consent-banner');
    if (existing) return;
    const banner = document.createElement('div');
    banner.id = 'consent-banner';
    banner.innerHTML = `
      <div class="consent-content">
        <p class="consent-title">We value your privacy</p>
        <p class="consent-text">We use cookies via Google AdSense to personalize ads and analyze traffic. You can choose which cookies to allow.</p>
        <div class="consent-actions">
          <button class="consent-btn consent-btn-accept" id="consent-accept">Accept All</button>
          <button class="consent-btn consent-btn-reject" id="consent-reject">Reject All</button>
          <button class="consent-btn consent-btn-customize" id="consent-customize">Customize</button>
        </div>
        <div id="consent-details" class="consent-details" style="display:none;">
          <label class="consent-option">
            <input type="checkbox" id="consent-ad-storage" checked>
            <span>Personalized ads (cookies)</span>
          </label>
          <label class="consent-option">
            <input type="checkbox" id="consent-analytics" checked>
            <span>Analytics (page views)</span>
          </label>
          <button class="consent-btn consent-btn-save" id="consent-save">Save Preferences</button>
        </div>
        <p class="consent-footer">
          <a href="privacy.html">Privacy Policy</a> | 
          <a href="https://adssettings.google.com" target="_blank" rel="noopener">Google Ad Settings</a>
        </p>
      </div>
    `;
    document.body.appendChild(banner);

    document.getElementById('consent-accept').onclick = function() {
      setConsent({
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted'
      });
    };

    document.getElementById('consent-reject').onclick = function() {
      setConsent({
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied'
      });
    };

    document.getElementById('consent-customize').onclick = function() {
      var details = document.getElementById('consent-details');
      details.style.display = details.style.display === 'none' ? 'block' : 'none';
    };

    document.getElementById('consent-save').onclick = function() {
      setConsent({
        ad_storage: document.getElementById('consent-ad-storage').checked ? 'granted' : 'denied',
        ad_user_data: document.getElementById('consent-ad-storage').checked ? 'granted' : 'denied',
        ad_personalization: document.getElementById('consent-ad-storage').checked ? 'granted' : 'denied',
        analytics_storage: document.getElementById('consent-analytics').checked ? 'granted' : 'denied'
      });
    };
  }

  function hideBanner() {
    var banner = document.getElementById('consent-banner');
    if (banner) banner.style.display = 'none';
  }

  var existing = getConsent();
  if (existing) {
    applyConsent(existing);
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }
  }
})();

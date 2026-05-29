/* ---- Cookie Consent Banner (GDPR + CCPA) ---- */

(function() {
  var CONSENT_KEY = 'financecalc_consent';
  var CONSENT_VERSION = 1;

  function getConsent() {
    try {
      var raw = localStorage.getItem(CONSENT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setConsent(choice) {
    var data = {
      version: CONSENT_VERSION,
      timestamp: Date.now()
    };
    data.ad_storage = choice.ad_storage || 'denied';
    data.ad_user_data = choice.ad_user_data || 'denied';
    data.ad_personalization = choice.ad_personalization || 'denied';
    data.analytics_storage = choice.analytics_storage || 'denied';
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
    } catch (e) {}
    try {
      applyConsent(choice);
    } catch (e) {}
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
    if (typeof window.adsbygoogle !== 'undefined' && window.adsbygoogle !== null) {
      try {
        var adConfig = {
          google_ad_client: 'ca-pub-5862355594319303',
          enable_page_level_ads: true
        };
        if (choice.ad_storage !== 'granted') {
          adConfig.non_personalized_ads = true;
        }
        window.adsbygoogle.push(adConfig);
      } catch (e) {}
    }
  }

  function showBanner() {
    if (document.getElementById('consent-banner')) return;
    var banner = document.createElement('div');
    banner.id = 'consent-banner';
    banner.innerHTML =
      '<div class="consent-content">' +
        '<p class="consent-title">We value your privacy</p>' +
        '<p class="consent-text">We use cookies via Google AdSense to personalize ads and analyze traffic. You can choose which cookies to allow.</p>' +
        '<div class="consent-actions">' +
          '<button class="consent-btn consent-btn-accept" id="consent-accept">Accept All</button>' +
          '<button class="consent-btn consent-btn-reject" id="consent-reject">Reject All</button>' +
          '<button class="consent-btn consent-btn-customize" id="consent-customize">Customize</button>' +
        '</div>' +
        '<div id="consent-details" class="consent-details" style="display:none;">' +
          '<label class="consent-option"><input type="checkbox" id="consent-ad-storage" checked> <span>Personalized ads (cookies)</span></label>' +
          '<label class="consent-option"><input type="checkbox" id="consent-analytics" checked> <span>Analytics (page views)</span></label>' +
          '<button class="consent-btn consent-btn-save" id="consent-save">Save Preferences</button>' +
        '</div>' +
        '<p class="consent-footer">' +
          '<a href="privacy.html">Privacy Policy</a> | ' +
          '<a href="https://adssettings.google.com" target="_blank" rel="noopener">Google Ad Settings</a>' +
        '</p>' +
      '</div>';
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
      var el = document.getElementById('consent-details');
      if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
    };

    document.getElementById('consent-save').onclick = function() {
      var adChecked = document.getElementById('consent-ad-storage') ? document.getElementById('consent-ad-storage').checked : false;
      var anChecked = document.getElementById('consent-analytics') ? document.getElementById('consent-analytics').checked : false;
      setConsent({
        ad_storage: adChecked ? 'granted' : 'denied',
        ad_user_data: adChecked ? 'granted' : 'denied',
        ad_personalization: adChecked ? 'granted' : 'denied',
        analytics_storage: anChecked ? 'granted' : 'denied'
      });
    };
  }

  function hideBanner() {
    try {
      var el = document.getElementById('consent-banner');
      if (el && el.parentNode) el.parentNode.removeChild(el);
    } catch (e) {}
  }

  var existing = getConsent();
  if (existing) {
    try { applyConsent(existing); } catch (e) {}
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }
  }
})();

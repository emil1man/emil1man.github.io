// RU: Простая i18n-инфраструктура. Загружает JSON с ключами и применяет переводы к элементам с data-i18n*.
// EN: Lightweight i18n loader. Fetches JSON locale files and applies translations to elements with data-i18n*.
// Purpose: обеспечить централизованное управление строками интерфейса и упростить добавление английской локали.
// Reason: позволяет переключать язык без вмешательства в бизнес-логику страницы.
(function () {
    const storageKey = 'site_lang';
    const defaultLang = document.documentElement.lang || 'ru';
    let currentLang = localStorage.getItem(storageKey) || defaultLang;
    let dict = {};

    async function loadLocale(lang) {
        try {
            const res = await fetch(`/assets/i18n/${lang}.json`);
            if (!res.ok) throw new Error('locale fetch failed');
            dict = await res.json();
            currentLang = lang;
            localStorage.setItem(storageKey, lang);
            document.documentElement.lang = lang;
            applyTranslations();
            return dict;
        } catch (e) {
            console.error('i18n load error', e);
            return {};
        }
    }

    function t(key, fallback) {
        return dict[key] ?? fallback ?? key;
    }

    function applyTranslations() {
        // data-i18n -> textContent
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const txt = t(key);
            if (txt !== undefined) el.textContent = txt;
        });

        // data-i18n-placeholder -> placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const txt = t(key);
            if (txt !== undefined) el.setAttribute('placeholder', txt);
        });

        // data-i18n-title -> title attribute
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const txt = t(key);
            if (txt !== undefined) el.setAttribute('title', txt);
        });

        // data-i18n-aria -> aria-label
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria');
            const txt = t(key);
            if (txt !== undefined) el.setAttribute('aria-label', txt);
        });

        // meta description via data-i18n-meta
        const metaDescEl = document.querySelector('meta[name="description"][data-i18n-meta]');
        if (metaDescEl) {
            const key = metaDescEl.getAttribute('data-i18n-meta');
            const txt = t(key);
            if (txt !== undefined) metaDescEl.setAttribute('content', txt);
        }

        // title element with data-i18n
        const titleEl = document.querySelector('title[data-i18n]');
        if (titleEl) {
            const key = titleEl.getAttribute('data-i18n');
            const txt = t(key);
            if (txt !== undefined) document.title = txt;
        }
    }

    // expose API
    window.siteI18n = {
        currentLangGetter: () => currentLang,
        loadLocale,
        t,
        applyTranslations,
        ready: loadLocale(currentLang)
    };
})();
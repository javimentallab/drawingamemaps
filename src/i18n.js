// Textos traducidos (src/_locales/<idioma>/messages.json, generados con tools/i18n-messages.py).
export const t = (key, ...subs) => chrome.i18n.getMessage(key, subs.map(String)) || key;

// Idioma de la interfaz del navegador, para formatear números y fechas.
export const LOCALE = chrome.i18n.getUILanguage();
export const num = (n) => Number(n).toLocaleString(LOCALE);

// Traduce el HTML: data-i18n (texto), data-i18n-title y data-i18n-placeholder.
export function localizeHtml(root = document) {
  for (const el of root.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of root.querySelectorAll('[data-i18n-title]')) el.title = t(el.dataset.i18nTitle);
  for (const el of root.querySelectorAll('[data-i18n-placeholder]')) el.placeholder = t(el.dataset.i18nPlaceholder);
  document.documentElement.lang = LOCALE.split('-')[0];
}

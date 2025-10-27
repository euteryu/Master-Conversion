import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import path from 'path-browserify'; // We need a browser-compatible path utility

// --- THIS IS THE FIX ---
// Check if the app is running in Electron. The process object is a good indicator.
const isElectron = !!(window && window.process && window.process.type);

// Determine the base path for loading translation files.
const loadPath = isElectron
  // In Electron, construct an absolute path relative to the app's root.
  // window.location.pathname will be something like `/C:/.../app.asar/frontend/build/index.html`
  // We go up two directories to get to the `app.asar` root, then down to `locales`.
  ? path.join(window.location.pathname, '..', '..', 'locales/{{lng}}/{{ns}}.json')
  // In a regular browser, use the relative path from the public folder.
  : 'locales/{{lng}}/{{ns}}.json';


i18n
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: true, // Keep this true for debugging
    interpolation: {
      escapeValue: false,
    },
    backend: {
      // Use the dynamically determined load path.
      loadPath: loadPath,
    },
  });

export default i18n;
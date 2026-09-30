/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      // Colors are CSS variables (see globals.css) so the whole palette
      // can be changed in one place.
      colors: {
        coal: v("coal"),
        surface: { DEFAULT: v("surface"), raised: v("surface-raised") },
        ink: { DEFAULT: v("ink"), soft: v("ink-soft"), muted: v("ink-muted") },
        mist: v("mist"),
        line: v("line"),
        brand: { DEFAULT: v("brand"), dark: v("brand-dark"), light: v("brand-light"), on: v("on-brand") },
        navy: { DEFAULT: v("navy"), dark: v("navy-dark") },
        pine: { DEFAULT: v("pine"), dark: v("pine-dark"), light: v("pine-light") },
        marigold: { DEFAULT: v("marigold"), light: v("marigold-light") },
        brick: { DEFAULT: v("brick"), light: v("brick-light") },
      },
      fontFamily: {
        sans: ["Figtree", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      borderRadius: { panel: "14px" },
      boxShadow: {
        brand: "0 6px 18px -6px rgb(var(--brand) / 0.45)",
      },
    },
  },
  plugins: [],
};

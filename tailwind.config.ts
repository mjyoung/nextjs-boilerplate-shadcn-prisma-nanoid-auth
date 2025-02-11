import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";

const config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    plugin(({ addComponents, addUtilities }) => {
      addComponents({
        ".btn": {
          "@apply py-3 px-4 rounded-lg center cursor-pointer font-semibold": {},
          "@apply disabled:cursor-not-allowed data-[loading=true]:animate-pulse data-[loading=true]:cursor-not-allowed":
            {},
          "@apply duration-150 ease-in-out active:scale-95": {},
        },
        ".btn-outline": {
          "@apply btn border border-gray-300 hover:bg-gray-100 text-black disabled:bg-gray-200":
            {},
        },
        ".btn-primary": {
          "@apply btn text-white bg-sky-700 hover:bg-sky-700/70 disabled:bg-gray-200":
            {},
        },
        ".btn-secondary": {
          "@apply btn text-white bg-gray-700 hover:bg-gray-700/80 disabled:bg-gray-200":
            {},
        },
        ".btn-black": {
          "@apply btn text-white bg-black hover:bg-black/80 disabled:bg-gray-200":
            {},
        },
        ".card": {
          "@apply rounded-lg border border-gray-200": {},
        },
        ".link": {
          "@apply text-sky-700 hover:underline font-semibold": {},
        },
        ".input-text": {
          "@apply py-2 px-3 rounded-lg border border-gray-200 outline-none focus:border-sky-700":
            {},
        },
      });
      addUtilities({
        ".center": {
          "@apply flex items-center justify-center": {},
        },
        ".absolute-center": {
          "@apply absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2":
            {},
        },
      });
    }),

    require("tailwindcss-animate"),
    require("tailwindcss-motion"),
  ],
} satisfies Config;

export default config;

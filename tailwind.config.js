/** @type {import('tailwindcss').Config}
 
 */
import daisyui from 'daisyui'
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"], // optional, you can change font
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      "light",
      "dark",
      "cupcake", // you can add/remove DaisyUI themes
    ],
  },
  darkMode: "class", // needed for next-themes toggle
};

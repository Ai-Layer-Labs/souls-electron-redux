import { heroui } from "@heroui/react";

const themes = {
  "themes": {
    "light": {
      "colors": {
        "default": {
          "50": "#fafafa",
          "100": "#f2f2f3",
          "200": "#ebebec",
          "300": "#e3e3e6",
          "400": "#dcdcdf",
          "500": "#d4d4d8",
          "600": "#afafb2",
          "700": "#8a8a8c",
          "800": "#656567",
          "900": "#404041",
          "foreground": "#000",
          "DEFAULT": "#d4d4d8"
        },
        "primary": {
          "50": "#f7f1ea",
          "100": "#ecddcd",
          "200": "#e2cab0",
          "300": "#d7b693",
          "400": "#cca376",
          "500": "#c18f59",
          "600": "#9f7649",
          "700": "#7d5d3a",
          "800": "#5c442a",
          "900": "#3a2b1b",
          "foreground": "#000",
          "DEFAULT": "#c18f59"
        },
        "secondary": {
          "50": "#fef6ea",
          "100": "#fde8cd",
          "200": "#fbdbb0",
          "300": "#face93",
          "400": "#f8c076",
          "500": "#f7b359",
          "600": "#cc9449",
          "700": "#a1743a",
          "800": "#75552a",
          "900": "#4a361b",
          "foreground": "#000",
          "DEFAULT": "#f7b359"
        },
        "success": {
          "50": "#e6fdfb",
          "100": "#c4fbf5",
          "200": "#a1f8ef",
          "300": "#7ff5e9",
          "400": "#5cf3e3",
          "500": "#3af0dd",
          "600": "#30c6b6",
          "700": "#269c90",
          "800": "#1c7269",
          "900": "#114842",
          "foreground": "#000",
          "DEFAULT": "#3af0dd"
        },
        "warning": {
          "50": "#fff4e2",
          "100": "#ffe5ba",
          "200": "#ffd592",
          "300": "#ffc66a",
          "400": "#ffb641",
          "500": "#ffa719",
          "600": "#d28a15",
          "700": "#a66d10",
          "800": "#794f0c",
          "900": "#4d3208",
          "foreground": "#000",
          "DEFAULT": "#ffa719"
        },
        "danger": {
          "50": "#ffe8e8",
          "100": "#ffc9c9",
          "200": "#ffa9a9",
          "300": "#ff8989",
          "400": "#ff6a6a",
          "500": "#ff4a4a",
          "600": "#d23d3d",
          "700": "#a63030",
          "800": "#792323",
          "900": "#4d1616",
          "foreground": "#000",
          "DEFAULT": "#ff4a4a"
        },
        "background": "#0D0D0D",
        "foreground": "#000000",
        "content1": {
          "DEFAULT": "#ffffff",
          "foreground": "#000"
        },
        "content2": {
          "DEFAULT": "#f4f4f5",
          "foreground": "#000"
        },
        "content3": {
          "DEFAULT": "#e4e4e7",
          "foreground": "#000"
        },
        "content4": {
          "DEFAULT": "#d4d4d8",
          "foreground": "#000"
        },
        "focus": "#ac5ec5",
        "overlay": "#000000"
      }
    },
    "dark": {
      "colors": {
        "default": {
          "50": "#323232",
          "100": "#636363",
          "200": "#959595",
          "300": "#c6c6c6",
          "400": "#f8f8f8",
          "500": "#f9f9f9",
          "600": "#fbfbfb",
          "700": "#fcfcfc",
          "800": "#fefefe",
          "900": "#ffffff",
          "foreground": "#000",
          "DEFAULT": "#f8f8f8"
        },
        "primary": {
          "50": "#3a2b1b",
          "100": "#5c442a",
          "200": "#7d5d3a",
          "300": "#9f7649",
          "400": "#c18f59",
          "500": "#cca376",
          "600": "#d7b693",
          "700": "#e2cab0",
          "800": "#ecddcd",
          "900": "#f7f1ea",
          "foreground": "#000",
          "DEFAULT": "#c18f59"
        },
        "secondary": {
          "50": "#4a361b",
          "100": "#75552a",
          "200": "#a1743a",
          "300": "#cc9449",
          "400": "#f7b359",
          "500": "#f8c076",
          "600": "#face93",
          "700": "#fbdbb0",
          "800": "#fde8cd",
          "900": "#fef6ea",
          "foreground": "#000",
          "DEFAULT": "#f7b359"
        },
        "success": {
          "50": "#114842",
          "100": "#1c7269",
          "200": "#269c90",
          "300": "#30c6b6",
          "400": "#3af0dd",
          "500": "#5cf3e3",
          "600": "#7ff5e9",
          "700": "#a1f8ef",
          "800": "#c4fbf5",
          "900": "#e6fdfb",
          "foreground": "#000",
          "DEFAULT": "#3af0dd"
        },
        "warning": {
          "50": "#4d3208",
          "100": "#794f0c",
          "200": "#a66d10",
          "300": "#d28a15",
          "400": "#ffa719",
          "500": "#ffb641",
          "600": "#ffc66a",
          "700": "#ffd592",
          "800": "#ffe5ba",
          "900": "#fff4e2",
          "foreground": "#000",
          "DEFAULT": "#ffa719"
        },
        "danger": {
          "50": "#4d1616",
          "100": "#792323",
          "200": "#a63030",
          "300": "#d23d3d",
          "400": "#ff4a4a",
          "500": "#ff6a6a",
          "600": "#ff8989",
          "700": "#ffa9a9",
          "800": "#ffc9c9",
          "900": "#ffe8e8",
          "foreground": "#000",
          "DEFAULT": "#ff4a4a"
        },
        "background": "#0D0D0D",
        "foreground": "#F8F8F8",
        "content1": {
          "DEFAULT": "#18181b",
          "foreground": "#fff"
        },
        "content2": {
          "DEFAULT": "#1A1A1A",
          "foreground": "#fff"
        },
        "content3": {
          "DEFAULT": "#5D5D5D",
          "foreground": "#fff"
        },
        "content4": {
          "DEFAULT": "#909090",
          "foreground": "#000"
        },
        "focus": "#ac5ec5",
        "overlay": "#0D0D0D"
      }
    }
  },
  "layout": {
    "disabledOpacity": "0.5"
  }
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  plugins: [heroui({ themes: themes["themes"] })],
  // plugins: [heroui()],
};

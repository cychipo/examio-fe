module.exports = {
  theme: {
    extend: {
      colors: {
        gradient: {
          from: "var(--gradient-from)",
          via: "var(--gradient-via)",
          to: "var(--gradient-to)",
        },
      },
      keyframes: {
        shine: {
          "0%": { "background-position": "100%" },
          "100%": { "background-position": "-100%" },
        },
      },
      animation: {
        shine: "shine 5s linear infinite",
      },
    },
  },
  plugins: [],
};

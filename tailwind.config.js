/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta operativa: base oscura tipo "tablero de control" de subestación,
        // pensada para uso a la intemperie / con sol directo (alto contraste).
        panel: {
          DEFAULT: "#12181f", // negro-azulado, no negro puro
          raised: "#1b232d",
          border: "#2a3542",
        },
        estado: {
          cerrado: "#22c55e", // verde: elemento cerrado / energizado
          abierto: "#ef4444", // rojo: elemento abierto / desenergizado
          desconocido: "#94a3b8", // gris: sin evento registrado
          offline: "#f59e0b", // ámbar: evento pendiente de sync
        },
        acento: "#ffb100", // ámbar EDERSA, para foco/selección, no decorativo
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      spacing: {
        touch: "3.25rem", // objetivo táctil mínimo en campo (52px)
      },
    },
  },
  plugins: [],
};

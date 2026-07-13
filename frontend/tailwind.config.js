/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ucak: {
          // Nouvelles couleurs basées sur le logo
          purple: '#7C3AED',      // Primaire - Élégant et premium
          cyan: '#06B6D4',        // Secondaire - Technologie et innovation
          lime: '#84CC16',        // Accent - Énergie et dynamique
          blue: '#003058',        // Bleu MET
          green: '#187840',       // Vert MET
          gold: '#FBBF24',        
          light: '#F8F0F0',       // Gris clair
          dark: '#002850',        // Bleu foncé secondaire
          'dark-card': '#1E293B', 
          'dark-hover': '#334155' 
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      // Ajout d'une animation de "lueur" pour le côté spirituel/tech
      animation: {
        'glow-pulse': 'glow-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        }
      }
    },
  },
  plugins: [],
}
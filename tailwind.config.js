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
          // Nouvelles couleurs modernes et vibrantes
          purple: '#7C3AED',      // Primaire - Élégant et premium
          cyan: '#06B6D4',        // Secondaire - Technologie et innovation
          lime: '#84CC16',        // Accent - Énergie et dynamique
          blue: '#3B82F6',        // Bleu (mis à jour pour meilleur contraste)
          green: '#10B981',       // Vert (mis à jour)
          gold: '#FBBF24',        // Or (mis à jour pour meilleur contraste)
          light: '#F8FAFC',       // Fond clair
          dark: '#0F172A',        // Slate-950 - Fond dark mode
          'dark-card': '#1E293B', // Slate-800 - Cartes dark mode
          'dark-hover': '#334155' // Slate-700 - Survols dark mode
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
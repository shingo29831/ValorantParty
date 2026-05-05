// AI Role: スタイル定義の提供
// 役割: Valorantのデザインシステムに基づいたカスタムカラーとアニメーションの定義

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        val: {
          red: '#ff4655',
          dark: '#111111',
          light: '#ece8e1',
          gray: '#768079',
          blue: '#0f1923'
        }
      },
      fontFamily: {
        // なぜ: ValorantのUIに近い直線的でインパクトのあるフォントスタックを指定
        sans: ['Inter', 'Oswald', 'sans-serif'], 
      },
      animation: {
        'glitch': 'glitch 0.2s cubic-bezier(.25, .46, .45, .94) both infinite',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
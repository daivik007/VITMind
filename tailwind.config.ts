
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(220, 13%, 18%)',
				input: 'hsl(220, 13%, 18%)',
				ring: 'hsl(222, 16%, 28%)',
				background: 'hsl(222, 20%, 10%)',
				foreground: 'hsl(220, 15%, 90%)',
				primary: {
					DEFAULT: 'hsl(210, 100%, 70%)',
					foreground: 'hsl(222, 20%, 10%)'
				},
				secondary: {
					DEFAULT: 'hsl(220, 13%, 18%)',
					foreground: 'hsl(220, 15%, 85%)'
				},
				destructive: {
					DEFAULT: 'hsl(0, 84%, 60%)',
					foreground: 'hsl(0, 0%, 98%)'
				},
				muted: {
					DEFAULT: 'hsl(222, 16%, 16%)',
					foreground: 'hsl(220, 10%, 60%)'
				},
				accent: {
					DEFAULT: 'hsl(270, 70%, 70%)',
					foreground: 'hsl(0, 0%, 98%)'
				},
				popover: {
					DEFAULT: 'hsl(222, 20%, 12%)',
					foreground: 'hsl(220, 15%, 90%)'
				},
				card: {
					DEFAULT: 'hsl(222, 20%, 13%)',
					foreground: 'hsl(220, 15%, 90%)'
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
				'neobrut': '0.5rem 0.5rem 0 #000',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(10px)' },
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' },
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out forwards',
				'fade-out': 'fade-out 0.5s ease-out forwards',
				'scale-in': 'scale-in 0.3s ease-out forwards',
				'pulse-slow': 'pulse-slow 3s infinite ease-in-out',
				'float': 'float 6s infinite ease-in-out',
			},
			backdropBlur: {
				xs: '2px',
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

# 🔐 AuthStarter — Angular / NestJS / Prisma / PostgreSQL / Tailwind

Un **boilerplate complet d’authentification fullstack**, moderne, typé et prêt à l’emploi.  
Stack : **Angular 18+**, **NestJS 10+**, **Prisma ORM**, **PostgreSQL**, **TailwindCSS**.

---

## 🎯 Objectif
Fournir une base solide et réutilisable pour tout projet nécessitant :
- Authentification sécurisée (JWT + Refresh)
- Gestion des rôles (`USER`, `ADMIN`)
- Frontend Angular responsive avec Tailwind
- Backend NestJS modulaire et Dockerisé
- UI harmonisée selon une charte verte et professionnelle

---

## 🧱 Stack technique

| Côté | Technologie | Description |
|------|--------------|-------------|
| Frontend | Angular 18+ | Standalone Components + TailwindCSS |
| Backend | NestJS 10+ | Auth REST API modulaire |
| ORM | Prisma | PostgreSQL |
| Auth | JWT + Refresh Tokens | Sécurisé avec Argon2 |
| DevOps | Docker / Compose | Setup local rapide |

---

## 🌈 Thème Tailwind
> Tous les composants UI suivent **strictement** cette configuration :

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter Tight', 'sans-serif'],
      },
      colors: {
        'brand-primary': '#b2da05ff',
        'brand-secondary': '#f7b501ff',
        'brand-green': '#01DC82',
        'brand-dark': '#003B3E',
        primary: {
          50: '#f0fdfd',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        accent: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
      },
      fontWeight: {
        'light': '300',
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
      },
    },
  },
  plugins: [],
}


## 🚀 Démarrage rapide

1. **Cloner le projet**
   ```bash
   git clone https://github.com/yourusername/auth-starter.git
   cd auth-starter
   ```

2. **Lancer l'application avec Docker en local**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Lancer docker en production**
   ```bash
   docker-compose up --build
   ```

3. **Accéder à l'application**
   - Frontend : [http://localhost](http://localhost)
   - Backend : [http://localhost:3000](http://localhost:3000)

---

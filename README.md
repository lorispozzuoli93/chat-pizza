# React + TypeScript + Vite


# Datapizza — Frontend Test (MVP)

## Overview
Frontend sviluppato con: React + TypeScript + Vite + Redux Toolkit + Material UI.  
Integrazione con backend fornito via FastAPI (containerizzato).
Per allegare i file ho usato una libreria chiamata drop zone in cui è previsto anche il drag and drop

## Requisiti
- Node 18+, npm
- Docker & Docker Compose (se vuoi eseguire i container)
- (opzionale) gh CLI per gestire repo/collaboratori

## Setup & sviluppo locale

1. Clona il repo frontend:
```bash
git clone git@github.com:TUOUSER/datapizza-frontend-test.git
cd datapizza-frontend-test
npm ci
npm i

Avvia il backend (in test-tecnico-frontend-engineer/):

cd ../test-tecnico-frontend-engineer
docker-compose up --build


Avvia il frontend (dev):

cd ../datapizza-frontend-test
npm run dev
# Vite proxy inoltra /api a http://localhost:8000 o http://llocalhost:5173/


API base (dev): http://localhost:5173/api proxato → backend http://localhost:8000/api

Build e Docker (opzionale)
npm run build
docker build -t datapizza-frontend:latest .
docker run -p 3000:80 datapizza-frontend:latest
```

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

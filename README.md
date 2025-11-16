# 📖 VBCI Church Directory (React + TypeScript UI)

The VBCI Church Directory started as a simple internal tool (the “Streamlit” version) and evolved into a complete full-stack system.  
This repository contains the **modern React + TypeScript UI** for browsing, searching, and managing church members and ministries.

The goal was to take something the church already needed and **level it up into a structured, scalable, and easy-to-use web application**.

# React + TypeScript + Vite

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

---

## 2️⃣ Frontend README – `church-directory-ui/README.md`

Open `church-directory-ui/README.md` and replace with:

```md
# VBCI Church Directory – Frontend

A modern React frontend for the **Victory Bible Church International (VBCI) Church Directory**, powered by a Java Spring Boot API.

This app lets church admins:

- Add new members
- Search by name, email, phone, or ministry
- Edit existing member details
- Delete members
- View live stats (total members, search matches)

All wrapped in a custom VBCI-branded UI with the official logo and purple theme.

## Tech Stack

- React (with Vite)
- TypeScript
- Tailwind CSS
- Fetch API (calling the Spring Boot backend)

## Screens

### Main Screen

- **Header**  
  - VBCI logo  
  - Title: **VBCI Church Directory**  
  - Subtitle: “Jesus is our victory…”

- **Add / Edit Member Card**  
  - Full Name (required)  
  - Email (required)  
  - Phone  
  - Ministry (Tech, Worship, Youth, Sound…)  
  - Button changes between **“Save Member”** and **“Update Member”**  
  - “Cancel edit” link when editing

- **Search & Stats Card**  
  - Search bar (live filtering by name, email, phone, ministry)  
  - Total member count  
  - Matching search count  

- **Members Table**  
  - Columns: Name, Email, Phone, Ministry, Actions  
  - Actions: **Edit** + **Delete**

## API Integration

The frontend expects the backend to run at:

```text
http://localhost:8080/api/members

# EV Chassis Load Distribution Analyzer (e-motion)

A 3D simulation and calculation platform for analyzing electric vehicle chassis load distribution, center of gravity (CG), and individual wheel reactions in real time.

---

## 🌐 Live GitHub Pages Demo

Once deployed via GitHub Actions, your app is live at:
👉 **[https://ayansh-srivastava-2006.github.io/e-motion/](https://ayansh-srivastava-2006.github.io/e-motion/)**

---

## 🚀 GitHub Pages Setup Instructions

The repository has been configured with an automated GitHub Actions deployment workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).

To activate it:

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Configure project for GitHub Pages deployment"
   git push origin main
   ```

2. Enable GitHub Actions for Pages in your repository:
   - Go to your repository on GitHub: **`https://github.com/Ayansh-Srivastava-2006/e-motion`**
   - Navigate to **Settings** > **Pages** (in the left sidebar).
   - Under **Build and deployment** > **Source**, choose **GitHub Actions** from the dropdown.

3. That's it! Every push to `main` will automatically run tests, compile the project, and publish the site. You can monitor the deployment status under the **Actions** tab on GitHub.

---

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run unit tests
npm test

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## ⚙ Key Configuration Changes Made for GitHub Pages

- **`vite.config.ts`**: Set relative base path (`base: process.env.BASE_URL || './'`) ensuring all bundled JavaScript, CSS, and asset files resolve accurately on GitHub Pages subpaths and custom domains.
- **`index.html` & `public/favicon.svg`**: Added relative favicon link and EV chassis SVG icon.
- **`public/404.html`**: Added SPA fallback redirect to ensure page refreshes and direct links route to the app seamlessly.
- **`.github/workflows/deploy.yml`**: Added GitHub Actions deployment pipeline with automated test verification, production build, and official Pages artifact deployment.
- **`.gitignore`**: Added standard repository ignores for build artifacts and local caches.

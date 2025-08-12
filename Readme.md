
```markdown
# mjs Framework & Project

## About the Project

This project is built using **mjs**, a custom lightweight framework that combines **React** and **Express** into a single unified development experience. Unlike Next.js, NestJS, or other popular frameworks, **mjs** is built from scratch to run both backend and frontend seamlessly on a single port.

The key goal of this project is to provide a simple yet powerful environment where frontend React UI and backend Express APIs coexist and work smoothly without the complexity of managing separate servers or ports.

---

## What is mjs?

**mjs** is a custom full-stack framework that:

- Integrates **React** for building frontend UI.
- Uses **Express** as the backend server framework.
- Runs frontend and backend on the **same Node.js server and port**.
- Uses modern build tools: **Webpack** for bundling, **Babel** for transpiling.
- Supports hot module replacement (HMR) during development.
- Serves static assets and React SPA from the backend server.
- Not based on existing meta-frameworks like Next.js or NestJS, but built from scratch tailored for simple full-stack projects.

---

## Features

- Single server architecture: no need for separate frontend/backend servers.
- Fast development with Webpack Dev Middleware and Hot Middleware.
- Custom routing for API and React routes.
- Static file serving with Express.
- Large JSON body parsing to support uploads (e.g., base64 images).
- Easy integration with additional Express middleware and routes.
- Clean separation of frontend and backend code in the project structure.

---

## Project Structure


---

## Getting Started

### Prerequisites

- Node.js >= 14
- npm or yarn

### Installation

```bash
npm install
````

### Running in Development

```bash
npm run dev
```

This will start the Express server with Webpack Dev Middleware and Hot Middleware enabled for live frontend reloading.

### Building for Production

```bash
npm run build
npm start
```

This builds the React app into the `/dist` folder and runs the server in production mode, serving static files from `/dist`.

---

## How It Works

* Express server serves API routes under `/api`.
* Static files like images and uploads are served under `/media`.
* React app served as a single-page application (SPA) via the server for all other routes.
* Webpack bundles React code and manages HMR during development.
* Backend and frontend share a single port simplifying deployment.

---

## Notes

* This framework is ideal for small to medium projects requiring tight backend-frontend integration.
* Not intended as a replacement for fully-featured frameworks like Next.js or NestJS.
* You can customize and extend the setup by adding more Express middleware or React components.

---


# Hermes AI Project

Welcome to the Hermes AI Frontend Repository!

This project features an interactive 3D model with WebGL graphics and a dynamic tailwind CSS interface. The frontend application is housed entirely within the `frontend/` directory.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have Node.js and npm installed.
- [Node.js](https://nodejs.org/en/) (v16.x or later recommended)
- [npm](https://www.npmjs.com/) (usually installed with Node.js)

### Installation

1. **Clone the repository**:
   \`\`\`bash
   git clone <repository-url>
   cd <repository-folder>
   \`\`\`

2. **Navigate to the frontend directory**:
   \`\`\`bash
   cd frontend
   \`\`\`

3. **Install the dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

4. **Start the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**:
   Navigate to \`http://localhost:5173\` to view the application.

## 📁 Project Structure

All frontend logic is located in the \`frontend/\` folder.
- \`src/\`: Contains the React components, styles, and Three.js logic.
    - \`components/HermesModel.jsx\`: The primary 3D model component using Three.js logic.
    - \`components/Galaxy.jsx\`: WebGL-powered galaxy particle background.
    - \`App.jsx\`: Main application layer composed with Tailwind CSS.
- \`public/\`: Static assets, including the \`models/\` folder for the Three.js GLTF objects.

## 🛠 Built With

- **[React](https://reactjs.org/)** - Frontend library for building UI components.
- **[Vite](https://vitejs.dev/)** - Next-generation frontend tooling.
- **[Three.js](https://threejs.org/)** - 3D JavaScript library.
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework for rapid UI development.
- **[OGL](https://github.com/oframe/ogl)** - Minimal WebGL library used for the dynamic Galaxy background.

## 🤝 Collaboration

When contributing to this repository, please follow standard fork and pull request workflows. Make sure to run the Vite dev server locally to catch any UI layering or 3D rendering issues before submitting a PR.

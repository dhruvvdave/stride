# Stride Web Application

React web application for Stride, built with Vite.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0

### Installation

```bash
npm install
```

### Running the App

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── pages/           # Page components
├── components/      # Reusable components
│   ├── Map/        # Map components
│   ├── Navigation/ # Navigation components
│   ├── Sidebar/    # Sidebar components
│   └── Layout/     # Layout components
├── services/        # API and service layer
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
└── styles/         # Global styles
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## License

MIT

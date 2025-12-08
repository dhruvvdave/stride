# Stride Backend API

This is the backend API server for Stride, built with Node.js and Express.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL 15+ with PostGIS extension
- Redis 4+

### Installation

```bash
npm install
```

### Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your local configuration.

### Database Setup

```bash
# Create database
createdb stride_dev

# Enable PostGIS
psql stride_dev -c "CREATE EXTENSION postgis;"

# Run migrations
npm run migrate

# Seed data (optional)
npm run seed
```

### Running the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## API Documentation

See [API Documentation](../docs/API_DOCUMENTATION.md) for complete API reference.

## Project Structure

```
src/
├── api/
│   ├── routes/      # API route handlers
│   └── middleware/  # Custom middleware
├── services/        # Business logic
├── models/          # Database models
├── utils/           # Utility functions
├── config/          # Configuration files
└── tests/           # Test files
    ├── unit/        # Unit tests
    ├── integration/ # Integration tests
    └── e2e/         # End-to-end tests
```

## License

MIT

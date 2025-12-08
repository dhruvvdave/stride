import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">
          Stride 🚗
        </h1>
        <p className="App-tagline">
          Navigate smarter. Drive smoother.
        </p>
      </header>
      
      <main className="App-main">
        <section className="Card">
          <h2>Welcome to Stride!</h2>
          <p>
            The navigation app that finds optimal routes by avoiding speed
            bumps, potholes, and rough roads.
          </p>
        </section>

        <section className="Card">
          <h2>Getting Started</h2>
          <p>
            This is the starter template for the Stride web application.
          </p>
          <p>
            Built with React, Vite, and TailwindCSS for a fast and modern
            development experience.
          </p>
        </section>

        <section className="Card">
          <h2>Features</h2>
          <ul className="Feature-list">
            <li>🗺️ Smart navigation with obstacle avoidance</li>
            <li>📍 Community-powered obstacle mapping</li>
            <li>🤖 AI-powered route optimization (Premium)</li>
            <li>📊 Advanced analytics and insights (Premium)</li>
          </ul>
        </section>
      </main>

      <footer className="App-footer">
        <p>
          Made with ❤️ for smooth drives everywhere
        </p>
      </footer>
    </div>
  );
}

export default App;

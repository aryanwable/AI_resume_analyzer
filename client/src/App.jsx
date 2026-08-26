import { useState } from 'react';
import './App.css';

function App() {
  const [status] = useState('Frontend initialized successfully');

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="badge">Day 2 • React + Vite Foundation</div>
        <h1>AI Resume Analyzer & Career Assistant</h1>
        <p className="subtitle">
          Next-generation resume analysis, explainable ATS scoring, and AI career guidance.
        </p>
      </header>

      <main className="app-main">
        <div className="card">
          <h2>Application Status</h2>
          <p className="status-text">{status}</p>
          <div className="tech-stack-pills">
            <span className="pill">React 18</span>
            <span className="pill">Vite 6</span>
            <span className="pill">JavaScript (ES Modules)</span>
          </div>
        </div>

        <div className="card">
          <h2>Next Step (Day 3)</h2>
          <p>
            Configuring <strong>Tailwind CSS</strong>, global styling variables, typography, and responsive design tokens.
          </p>
        </div>
      </main>

      <footer className="app-footer">
        <p>AI Resume Analyzer • Portfolio Development Project</p>
      </footer>
    </div>
  );
}

export default App;

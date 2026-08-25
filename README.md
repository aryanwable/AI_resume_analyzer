# AI Resume Analyzer & Career Assistant

An intelligent web application that analyzes resumes against job descriptions, providing explainable scoring, AI-powered recommendations, and career guidance.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## Overview

AI Resume Analyzer helps job seekers optimize their resumes by:

- **Uploading** a resume PDF and extracting text automatically
- **Comparing** resume content against a target job description
- **Scoring** the match with an explainable, weighted breakdown
- **Identifying** matched skills, missing skills, and missing keywords
- **Analyzing** resume strengths and weaknesses using AI
- **Generating** AI-powered recommendations for improvement
- **Rewriting** weak resume bullet points with stronger alternatives
- **Creating** professional summaries based on actual experience
- **Recommending** suitable job roles based on candidate profile
- **Tracking** analysis history to measure improvement over time

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React | UI component library |
| Vite | Build tool & dev server |
| JavaScript | Application logic |
| Tailwind CSS | Utility-first styling |
| React Router | Client-side routing |
| Axios | HTTP client |
| Framer Motion | Animations & transitions |
| Recharts | Data visualization & charts |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | Web framework & REST APIs |
| MongoDB | NoSQL database |
| Mongoose | MongoDB ODM |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |

### AI & Processing
| Technology | Purpose |
|---|---|
| LLM API | Resume analysis & recommendations |
| Embeddings | Semantic similarity matching |
| pdf-parse | PDF text extraction |

---

## Project Structure

```
AI_resume_analyzer/
├── client/                 # React frontend (Vite)
│   ├── public/             # Static assets
│   └── src/
│       ├── assets/         # Images, icons, fonts
│       ├── components/     # Reusable UI components
│       ├── context/        # React context providers
│       ├── hooks/          # Custom React hooks
│       ├── layouts/        # Page layout components
│       ├── pages/          # Route page components
│       ├── services/       # API service functions
│       ├── utils/          # Utility/helper functions
│       ├── App.jsx         # Root application component
│       ├── main.jsx        # Application entry point
│       └── index.css       # Global styles
│
├── server/                 # Express backend
│   └── src/
│       ├── config/         # Database & app configuration
│       ├── controllers/    # Route handler functions
│       ├── middleware/     # Express middleware
│       ├── models/         # Mongoose data models
│       ├── routes/         # API route definitions
│       ├── services/       # Business logic services
│       ├── utils/          # Utility/helper functions
│       └── app.js          # Express application setup
│
├── docs/                   # Project documentation
│   └── development-log.md  # Development progress log
│
├── .env.example            # Environment variable template
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas)
- An AI/LLM API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aryanwable/AI_resume_analyzer.git
   cd AI_resume_analyzer
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and fill in your values
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

5. **Start the development servers**

   Backend:
   ```bash
   cd server
   npm run dev
   ```

   Frontend:
   ```bash
   cd client
   npm run dev
   ```

---

## Features

### Resume Analysis
- PDF upload with drag-and-drop support
- Automatic text extraction from resume PDFs
- Resume storage and management

### Job Description Matching
- Job description text input
- Skill and keyword extraction
- Matched vs. missing skills identification

### Explainable Scoring
- Weighted scoring breakdown:
  - Skills Match (25%)
  - Keyword Match (20%)
  - Experience Relevance (20%)
  - Project Relevance (15%)
  - ATS & Formatting (10%)
  - Education (10%)
- Configurable scoring weights

### AI-Powered Insights
- Strength and weakness analysis
- Personalized improvement recommendations
- Resume bullet point rewriting
- Professional summary generation
- Suitable job role recommendations

### Semantic Matching
- Embedding-based resume/JD comparison
- Vector similarity scoring
- Hybrid keyword + semantic matching

### Dashboard & History
- Visual score breakdowns with charts
- Analysis history tracking
- Score progression over time

---

## API Documentation

*API documentation will be added as endpoints are implemented.*

---

## Development

This project is being built over a 60-day development cycle. See the [Development Log](docs/development-log.md) for detailed progress updates.

### Development Phases

| Phase | Days | Focus |
|---|---|---|
| Foundation | 1–7 | Project setup, architecture, basic layout |
| Authentication | 8–14 | User registration, login, JWT, protected routes |
| Resume Management | 15–21 | Upload, PDF parsing, storage |
| JD Analysis | 22–28 | Skill extraction, keyword matching |
| Scoring Engine | 29–35 | Explainable weighted scoring system |
| AI Integration | 36–43 | LLM prompts, structured analysis |
| Advanced AI | 44–50 | Embeddings, semantic matching, rewriter |
| Dashboard | 51–55 | Visualizations, history, polish |
| Production | 56–60 | Testing, security, deployment, docs |

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Author

**Aryan Wable**

Final-year Computer Engineering student.

---

*Built with ❤️ as a portfolio project demonstrating full-stack development, AI integration, and software engineering practices.*

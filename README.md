# 📦 GitHub Repo Explorer

A feature-rich React + Vite application for exploring GitHub repositories. Search, sort, and manage repositories with an intuitive interface.

## ✨ Features

### Core Features
- 🔍 Advanced repository search:
  - Search by username
  - Search by repository name
  - Filter by programming language
  - Real-time search suggestions
- 📊 Repository Management:
  - Infinite scroll pagination
  - Sort by name, stars, or creation date
  - Filter by programming languages
  - Bulk repository cloning

### AI-Powered Features
- 🤖 Smart Repository Analysis:
  - Code quality assessment
  - Repository health scoring
  - Dependency vulnerability detection
  - Documentation coverage analysis
- 🔮 Intelligent Recommendations:
  - Similar repository suggestions
  - Best practices recommendations
  - Security improvement tips
  - Performance optimization insights
- 🎯 AI-Assisted Search:
  - Natural language query processing
  - Semantic code search
  - Context-aware filtering
  - Smart repository categorization
- 📊 Advanced Analytics:
  - Predictive trend analysis
  - Code complexity metrics
  - Technical debt assessment
  - Community engagement insights

### Data Export Options
- 📑 Export repository data as:
  - CSV format
  - JSON format
  - PDF reports

### UI/UX Features
- 🌓 Dark/Light mode toggle
- 📱 Responsive design for all devices
- 🔄 Real-time data updates
- 📊 Language usage visualization
- 📖 README preview modal

## 🛠️ Tech Stack

- **Frontend:**
  - React 18
  - Vite
  - Tailwind CSS
  - Framer Motion
  - Hero Icons

- **AI Integration:**
  - **Language Models:**
    - Google Gemini API
    - Natural Language Processing
    - Machine Learning Models
  - **AI Features:**
    - Code Analysis Tools
    - Semantic Search Engine
    - Pattern Recognition
    - Predictive Analytics

- **APIs & Integration:**
  - GitHub REST API
  - Octokit
  - Google Gemini API

- **Development Tools:**
  - ESLint
  - Prettier
  - PostCSS
  - Node.js >= 16

## 📥 Installation

### Prerequisites
- Node.js (version >= 16)
- npm or yarn
- Git
- GitHub Personal Access Token

### Setup Steps

1. **Clone the Repository**
```bash
git clone https://github.com/nitin8217/github-repo-explorer.git
cd github-repo-explorer
```

2. **Environment Configuration**
Create a `.env` file in the root directory:
```env
VITE_GITHUB_TOKEN=your_github_token
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GITHUB_CLIENT_SECRET=your_client_secret
VITE_GITHUB_CLIENT_ID=your_client_id
VITE_API_URL=http://localhost:3001
PORT=3001
```

3. **Install Dependencies**
```bash
npm install
```

4. **Start Development Server**
```bash
npm run dev
```

## 🚀 Usage Guide

### Repository Search
1. Enter a GitHub username or repository name
2. Use filters to refine results
3. Sort results using available options

### Bulk Clone Feature
1. Select repositories to clone
2. Click "Bulk Clone" button
3. Choose OS-specific script (Windows/Unix)
4. Follow the generated script instructions

### Data Export
1. Select repositories to export
2. Click export button
3. Choose format (CSV/JSON/PDF)
4. Save the exported file

### AI Features Usage
1. **Smart Analysis**
   - View repository health score
   - Check code quality metrics
   - Review security recommendations

2. **Intelligent Search**
   - Use natural language queries
   - Search by code patterns
   - Find similar repositories

3. **Analytics Dashboard**
   - Monitor repository trends
   - Track code complexity
   - Analyze community engagement

## ⚙️ Configuration Options

### Rate Limiting
- Default: 10 repositories per batch
- Configurable through UI
- Recommended: 5-10 repos per batch

### API Limits
- GitHub API: 5000 requests per hour
- Batch operations: Maximum 100 repos

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🔗 Links

- [Live Demo](https://github-repo-explorer-gir4.vercel.app/)
- [GitHub Repository](https://github.com/nitin8217/github-repo-explorer)
- [Bug Report](https://github.com/nitin8217/github-repo-explorer/issues)

## 📞 Support

For support, email nitinthalur0@gmail.com or open an issue in the repository.

---

Made with ❤️ by Nitin

import { GoogleGenerativeAI } from "@google/generative-ai";

const RATE_LIMIT = {
  requestsPerMinute: 2,        // Reduced from 3 to 2
  intervalMs: 60000,           // 1 minute
  minDelay: 35000,            // Increased to 35 seconds
  maxRetries: 3,              // Increased to 3 retries
  retryDelay: 45000,          // Increased to 45 seconds
  backoffMultiplier: 1.5      // Each retry waits 1.5x longer
};

class RateLimiter {
  constructor() {
    this.queue = [];
    this.lastCallTime = 0;
    this.requestsThisInterval = 0;
    this.intervalStart = Date.now();
    this.activeRequests = 0;
    this.isProcessing = false;
  }

  async addToQueue(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ 
        fn, 
        resolve, 
        reject,
        retryCount: 0,
        addedAt: Date.now()
      });
      
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  calculateBackoff(retryCount) {
    return RATE_LIMIT.retryDelay * Math.pow(RATE_LIMIT.backoffMultiplier, retryCount);
  }

  async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const now = Date.now();

    // Reset if interval passed
    if (now - this.intervalStart >= RATE_LIMIT.intervalMs) {
      this.requestsThisInterval = 0;
      this.intervalStart = now;
      this.activeRequests = 0;
    }

    // Check rate limits
    if (this.activeRequests >= RATE_LIMIT.requestsPerMinute || 
        this.requestsThisInterval >= RATE_LIMIT.requestsPerMinute) {
      const waitTime = RATE_LIMIT.intervalMs - (now - this.intervalStart) + 1000; // Add 1s buffer
      setTimeout(() => this.processQueue(), waitTime);
      return;
    }

    // Enforce minimum delay between requests
    const timeSinceLastCall = now - this.lastCallTime;
    if (timeSinceLastCall < RATE_LIMIT.minDelay) {
      setTimeout(() => this.processQueue(), RATE_LIMIT.minDelay - timeSinceLastCall + 1000);
      return;
    }

    const request = this.queue[0];
    this.activeRequests++;

    try {
      this.lastCallTime = now;
      this.requestsThisInterval++;
      const result = await request.fn();
      this.queue.shift();
      this.activeRequests--;
      request.resolve(result);
    } catch (error) {
      this.activeRequests--;
      
      if (error.status === 429 && request.retryCount < RATE_LIMIT.maxRetries) {
        request.retryCount++;
        const backoffTime = this.calculateBackoff(request.retryCount);
        console.log(`Rate limited. Retrying in ${backoffTime/1000}s (Attempt ${request.retryCount}/${RATE_LIMIT.maxRetries})`);
        
        // Move to end of queue with exponential backoff
        this.queue.push({
          ...this.queue.shift(),
          addedAt: now + backoffTime
        });
        
        setTimeout(() => this.processQueue(), backoffTime);
        return;
      }

      this.queue.shift();
      request.reject(error);
    }

    // Process next item with enforced delay
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), RATE_LIMIT.minDelay);
    } else {
      this.isProcessing = false;
    }
  }
}


const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Fallback analysis function when AI is unavailable
function generateBasicInsights(repo) {
  const lastUpdated = new Date(repo.updated_at);
  const daysSinceUpdate = Math.floor((new Date() - lastUpdated) / (1000 * 60 * 60 * 24));
  
  return `Basic Repository Analysis:

Project Overview:
- Name: ${repo.name}
- Primary Language: ${repo.language || 'Not specified'}
- Description: ${repo.description || 'No description provided'}

Activity Metrics:
- Stars: ${repo.stargazers_count}
- Forks: ${repo.forks_count}
- Open Issues: ${repo.open_issues_count}
- Last Updated: ${daysSinceUpdate} days ago

Key Points:
1. Project Type: ${repo.topics?.length ? `Related to ${repo.topics.join(', ')}` : 'No topics specified'}
2. Development Status: ${daysSinceUpdate < 30 ? 'Active' : 'Less active'} (last updated ${daysSinceUpdate} days ago)
3. Community Interest: ${repo.stargazers_count > 100 ? 'High' : repo.stargazers_count > 10 ? 'Moderate' : 'Growing'} (${repo.stargazers_count} stars)
4. Technical Stack: ${repo.language || 'Not specified'} based project
5. Collaboration Level: ${repo.forks_count} forks indicate ${repo.forks_count > 10 ? 'active' : 'growing'} community involvement`;
}

export async function generateRepoInsights(repo) {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    return generateBasicInsights(repo);
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });

    const prompt = `
Act as an expert GitHub repository analyzer. Analyze this repository data and provide detailed insights:

Repository Information:
-------------------
Name: ${repo.name}
Description: ${repo.description || 'No description'}
Language: ${repo.language || 'Not specified'}
Topics: ${repo.topics?.join(', ') || 'None'}
Stars: ${repo.stargazers_count}
Forks: ${repo.forks_count}
Open Issues: ${repo.open_issues_count}
Last Updated: ${new Date(repo.updated_at).toLocaleDateString()}

Please provide an analysis covering:
1. Project significance and purpose
2. Development momentum and health
3. Community adoption metrics
4. Technical architecture insights
5. Growth potential and recommendations

Format the response in clean markdown with emoji indicators for each section.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.warn('Gemini analysis failed, falling back to basic insights:', error);
    return generateBasicInsights(repo);
  }
}
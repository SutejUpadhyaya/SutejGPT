SutejGPT

SutejGPT is a full-stack, locally hosted LLM-powered web application that generates responses in a consistent personal voice. The system processes user input through structured API request pipelines and injects persistent identity and behavioral context at runtime to maintain stable reasoning patterns, tone, and preferences across interactions. The project is actively under development and intentionally unfinished, as it is being built iteratively to explore scalability, controlled personalization, and production-style system design rather than serving as a static demo.

The application is designed as a real system, not a toy interface. It includes authentication, role-based access control, admin-managed identity data, and a clear separation between user interaction, identity configuration, and model execution. Identity and behavior are treated as explicit, inspectable components rather than implicit or automatically learned state.

SYSTEM OVERVIEW
At a high level, the application operates as follows: a user submits input through the frontend UI, the backend validates authentication and user role using JWT-based middleware, user input is combined with mode-specific response constraints and persistent identity context, a structured request is sent to a large language model API, and the response is post-processed and returned to the client. Identity memory is stored separately from user input and conversation history and is injected at request time, allowing the system’s behavior to evolve in a controlled and intentional manner without exposing internal configuration to end users.

FEATURES
Ask (LLM Query): Accepts free-form user questions and generates responses that follow a consistent personal reasoning style. Two response modes are supported. Casual mode produces informal, conversational, and direct responses that mirror how I naturally explain things. Professional mode preserves the same underlying logic and priorities but outputs cleaner, structured, and recruiter-appropriate responses.

Interpret (Structured Analysis): Accepts text written by me and returns a structured analysis including summary, intent, tone or vibe, implied request, likely misinterpretations, suggested replies, and multiple semantically equivalent rewrites. This mode treats the language model as an analysis engine rather than a conversational agent.

Identity Memory (Admin-only): Persistent identity data defining background context, values, communication habits, and tone constraints. Identity data is stored outside of user input, injected at runtime, and editable only by admin users. This prevents untrusted users from modifying system behavior or corrupting identity state.

Authentication and Access Control: Email and password authentication with bcrypt password hashing, JWT-based session management, and role-based access control. Admin users can manage identity data, while regular users are limited to querying and interpretation features.

TECH STACK
Backend: Node.js, Express, OpenAI Responses API, JWT authentication, bcrypt password hashing, dotenv configuration, local JSON persistence, ES Modules.
Frontend: React, Vite, custom CSS with a dark UI.

PROJECT STRUCTURE
backend/ (auth, memory, prompts, routes, openaiClient.js, server.js)
frontend/ (src/App.jsx, App.css, index.css, main.jsx)
README.md

ENVIRONMENT SETUP
Create a .env file inside the backend directory with the following values:
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_long_random_secret
ADMIN_EMAIL=your_email@example.com

PORT=3001
Do not commit the .env file.

RUNNING THE APPLICATION
Backend:
cd backend
npm install
npm start
Backend runs on http://localhost:3001

Frontend:
cd frontend
npm install
npm run dev
Frontend runs on http://localhost:5173

INITIAL SETUP
Start both the backend and frontend servers. Register using the email specified in ADMIN_EMAIL (this account is automatically granted admin privileges). Log in, configure identity data if needed, and begin querying or interpreting input through the UI.

DESIGN GOALS
Explicit control over identity and behavior, clear separation between user input and system configuration, inspectable and editable identity data, secure access control, and predictable, consistent outputs across modes.

STATUS
Actively developed. Built as a portfolio-quality LLM system with a focus on backend architecture, access control, identity management, and intentional personalization. Planned improvements include stronger identity influence, database-backed persistence, UI enhancements, and additional integration surfaces.

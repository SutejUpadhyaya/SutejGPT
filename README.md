# SutejGPT

SutejGPT is a full-stack, locally hosted LLM-powered web application designed to function as a controlled, evolving clone of my reasoning and communication style. The system is built to think, explain, and respond the way I do, while remaining inspectable, intentional, and access-controlled.

Rather than relying on conversation history or implicit learning, SutejGPT injects explicit identity, behavioral rules, and tone constraints at runtime. This allows the system to consistently reason and communicate “like me” across sessions, users, and use cases, while still evolving in a controlled way over time.

The application is built as a real system with production-style architecture and access control, and is actively developed iteratively.

---

## Why This Is Not a Simple Chat Interface

Many LLM applications expose a text box directly connected to a model API. SutejGPT intentionally goes beyond that pattern.

In this system, the language model acts as a constrained execution engine operating under explicit identity, tone, and behavioral rules. Identity and behavior are modeled as first-class, inspectable system components rather than emergent properties of chat history.

Key characteristics:

- The system is designed to behave as a clone of my reasoning and communication style
- Identity and behavior are stored explicitly, not inferred from conversation logs
- System behavior is injected at request time rather than learned automatically
- User input is separated from identity configuration and system state
- Identity memory is editable only by the admin
- Outputs are designed to remain consistent and recognizable across sessions

The goal is to build a predictable, inspectable, and evolvable LLM-backed system that reliably thinks and responds the way I would.

---

## System Overview

At a high level, the application operates as follows:

1. A user submits input through the frontend UI.
2. The backend validates authentication and user role using JWT-based middleware.
3. User input is combined with:
   - Mode-specific response constraints (Casual or Professional)
   - Persistent identity memory defining how I think, explain, and prioritize information
4. A structured request is sent to the OpenAI Responses API.
5. The response is post-processed and returned to the client.

Identity memory is stored separately from user input and conversation history and is injected at runtime. This allows the system to evolve intentionally while preserving a stable and recognizable core identity.

---

## Features

### Ask (LLM Query)

The Ask feature allows users to ask general questions and receive responses that follow my reasoning style and priorities.

Two response modes are supported:

- Casual  
  Responses are informal, direct, and conversational, mirroring how I naturally explain things to friends or classmates. The system reasons through the problem the way I would and responds accordingly.

- Professional  
  Responses preserve the same underlying logic and thought process but are expressed in a cleaner, more structured, and recruiter-appropriate tone. This mode is useful for professional communication while maintaining the same reasoning patterns.

In both modes, the system processes external information through the model and responds as I would, rather than generating generic answers.

---

### Interpret (Structured Analysis)

The Interpret feature accepts any message written by me and returns a structured analysis including:

- Summary of what the message is saying
- Intent behind the message
- Tone or vibe
- What I am implicitly asking for
- Likely misinterpretations by the recipient
- Suggested replies
- Multiple rewrites that preserve meaning while adjusting tone or clarity

This feature treats the model as an analysis engine that understands how I communicate and interprets my messages accordingly.

---

### Identity Memory (Admin-Only)

Persistent identity data defines background context, values, habits, communication preferences, and tone rules.

- Stored outside of user input and conversation history
- Injected into every Ask request at runtime
- Editable only by the admin account

This ensures the system evolves intentionally and remains aligned with my identity without being altered by untrusted users.

---

### Authentication & Access Control

- Email and password authentication
- bcrypt password hashing
- JWT-based session management
- Role-based access control

There is exactly one admin account, defined by configuration.  
All other users are non-admin and cannot modify identity memory.

---

## Tech Stack

Backend:
- Node.js
- Express
- OpenAI Responses API
- JWT authentication
- bcrypt
- dotenv
- Local JSON persistence
- ES Modules

Frontend:
- React
- Vite
- Custom CSS (dark UI)

---

## Project Structure

backend/
  auth/
  memory/
  prompts/
  routes/
  openaiClient.js
  server.js

frontend/
  src/
    App.jsx
    App.css
    index.css
    main.jsx

README.md

---

## Environment Setup

Create a .env file inside the backend directory with the following values:

OPENAI_API_KEY=your_openai_api_key  
JWT_SECRET=your_long_random_secret  
ADMIN_EMAIL=sutejupadhyaya@gmail.com  
PORT=3001  

Do not commit the .env file.

---

## Running the Application

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

---

## Initial Setup

1. Start both the backend and frontend servers.
2. Register using the email specified in ADMIN_EMAIL.
   - This account is automatically granted admin privileges.
3. Log in.
4. (Admin only) Configure identity memory if desired.
5. Use Ask or Interpret through the UI.

---

## Design Goals

- Explicit control over identity and behavior
- Clear separation between user input and system configuration
- Inspectable and editable identity data
- Secure access control
- Predictable and recognizable outputs that think and respond like me

---

## Status

Actively developed.

SutejGPT is a portfolio-quality LLM system focused on backend architecture, access control, identity management, and intentional personalization. Planned improvements include stronger identity influence tuning, database-backed persistence, UI enhancements, and additional integration surfaces.

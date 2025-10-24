# Mini CRM Project

## Project Description

Mini CRM is a simple Customer Relationship Management system designed for freelancers and small teams. The project consists of two parts: a backend API built with NestJS and a frontend web application built with Next.js.

## Features

### Core Functionality:
- **User Management**: Registration, login, JWT authentication
- **Client Management**: Add, view, edit, delete clients
- **Invoice Management**: Create, track, manage invoices and payments
- **Dashboard**: Analytics, metrics, and business insights
- **Security**: Protected routes, password hashing, session management

### AI-Powered Features:
- **Multi-Agent AI System**: 4 specialized AI agents working together
- **Intelligent Research**: Semantic search across client data and knowledge base
- **Advanced Analytics**: Sentiment analysis, churn prediction, priority assessment
- **Smart Communication**: AI-generated responses and email drafts
- **Intelligent Coordination**: Automated workflow orchestration using LangGraph

## AI System Architecture

### AI Agents Overview

#### 1. **Research Agent**
**Purpose**: Intelligent information retrieval and knowledge discovery
- **Vector Search**: Uses Pinecone for semantic similarity search
- **Database Queries**: Structured SQL queries for precise data retrieval
- **Knowledge Synthesis**: Combines multiple data sources for comprehensive answers
- **Context Awareness**: Understands relationships between clients, invoices, and history

**API Endpoints**:
- `POST /api/v1/agents/research` - General research queries
- `POST /research/search` - Semantic search
- `POST /research/index` - Index new knowledge
- `POST /research/test-pinecone` - Test vector database connection

#### 2. **Analytics Agent**
**Purpose**: Business intelligence and predictive analytics
- **Sentiment Analysis**: Detects emotional tone in client communications
- **Churn Prediction**: Identifies clients at risk of leaving
- **Priority Assessment**: Automatically prioritizes tasks and opportunities
- **Trend Analysis**: Identifies patterns in business metrics

**API Endpoints**:
- `POST /api/v1/analytics/tone` - Analyze communication tone
- `POST /api/v1/analytics/priority` - Assess task priority
- `POST /api/v1/analytics/churn` - Predict client churn risk
- `POST /api/v1/analytics/comprehensive` - Full business analysis
- `GET /api/v1/analytics/dashboard/summary` - Dashboard analytics
- `GET /api/v1/analytics/global` - Global business metrics

#### 3. **Communication Agent**
**Purpose**: Automated customer communication and content generation
- **Response Generation**: Creates personalized responses based on client history
- **Email Drafting**: Generates professional email drafts
- **Context Integration**: Uses research data for relevant communications
- **Tone Adaptation**: Adjusts communication style based on client preferences

**API Endpoints**:
- `POST /api/v1/agents/communication/response` - Generate responses
- `POST /api/v1/agents/communication/draft` - Create email drafts

#### 4. **Coordinator Agent**
**Purpose**: Intelligent orchestration of all AI agents
- **Workflow Management**: Coordinates complex multi-step processes
- **Smart Routing**: Automatically selects appropriate agents for tasks
- **LangGraph Integration**: Uses advanced workflow graphs for decision making
- **Batch Processing**: Handles multiple requests efficiently

**API Endpoints**:
- `POST /api/v1/coordinator/coordinate` - Main coordination endpoint
- `POST /api/v1/coordinator/analytics` - Analytics coordination
- `POST /api/v1/coordinator/research` - Research coordination
- `POST /api/v1/coordinator/communication` - Communication coordination
- `GET /api/v1/coordinator/health` - System health check
- `GET /api/v1/coordinator/tools` - Available tools
- `POST /api/v1/coordinator/tools/execute` - Execute specific tools

### AI Infrastructure

#### **Core Technologies**:
- **OpenAI GPT-4**: Large language model for text generation and analysis
- **Pinecone**: Vector database for semantic search and embeddings
- **LangGraph**: Workflow orchestration and agent coordination
- **LangChain**: Framework for building AI applications

#### **Data Processing**:
- **Embeddings**: Text converted to vector representations for similarity search
- **RAG (Retrieval-Augmented Generation)**: Combines knowledge retrieval with generation
- **Multi-modal Analysis**: Processes both structured data and natural language

#### **Integration Points**:
- **Database Integration**: Direct access to PostgreSQL for structured data
- **Cache Integration**: Redis for session management and temporary storage
- **API Integration**: RESTful endpoints for frontend communication

### AI Use Cases

#### **Customer Service Automation**:
- Generate personalized responses to client inquiries
- Analyze customer sentiment from communications
- Predict and prevent customer churn

#### **Business Intelligence**:
- Automated report generation
- Trend analysis and forecasting
- Priority task identification

#### **Knowledge Management**:
- Intelligent search across all client data
- Automated knowledge base updates
- Context-aware information retrieval

#### **Workflow Optimization**:
- Automated task routing and prioritization
- Smart communication scheduling
- Predictive analytics for business decisions

### API Endpoints:
- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `GET /auth/profile` - Get user profile
- `GET /clients` - List all clients
- `POST /clients` - Create new client
- `PUT /clients/:id` - Update client
- `DELETE /clients/:id` - Delete client
- `GET /invoices` - List all invoices
- `POST /invoices` - Create new invoice
- `PUT /invoices/:id` - Update invoice
- `DELETE /invoices/:id` - Delete invoice

### AI Configuration

#### Environment Variables:
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=minicrm-knowledge

# Database Configuration
DATABASE_URL="postgresql://admin:admin123@postgres:5432/new_crm?sslmode=disable"

# Redis Configuration
REDIS_URL=redis://redis:6379

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d
```

#### AI System Requirements:
- **OpenAI API Key**: Required for all AI functionality
- **Pinecone Account**: Required for vector search capabilities
- **PostgreSQL**: For structured data storage
- **Redis**: For caching and session management

### AI Examples

#### Research Query:
```bash
curl -X POST http://localhost:8080/api/v1/agents/research \
    -H "Content-Type: application/json" \
    -d '{"query": "Find all clients with unpaid invoices over $1000", "type": "financial"}'
```

#### Sentiment Analysis:
```bash
curl -X POST http://localhost:8080/api/v1/analytics/tone \
    -H "Content-Type: application/json" \
    -d '{"text": "I am very disappointed with the service quality"}'
```

#### Generate Response:
```bash
curl -X POST http://localhost:8080/api/v1/agents/communication/response \
    -H "Content-Type: application/json" \
    -d '{"query": "Client is asking about invoice status", "context": {"clientId": 123}}'
```

#### Coordinator Workflow:
```bash
curl -X POST http://localhost:8080/api/v1/coordinator/coordinate \
    -H "Content-Type: application/json" \
    -d '{"task": "Analyze client satisfaction and generate follow-up email", "clientId": 123}'
```

## Technology Stack

### Backend:
- **NestJS** - Node.js framework for scalable server-side applications
- **Prisma** - Next-generation ORM for database management
- **PostgreSQL** - Relational database for data persistence
- **Redis** - In-memory cache for session management
- **JWT** - JSON Web Tokens for secure authentication
- **bcrypt** - Password hashing for security
- **TypeScript** - Static typing for better development experience

### Frontend:
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Static typing for frontend development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

### DevOps & Tools:
- **Docker & Docker Compose** - Containerization and orchestration
- **ESLint** - Code linting and quality assurance
- **Prettier** - Code formatting
- **Git** - Version control system

### AI & Advanced Features:
- **Multi-Agent AI System**: 4 specialized agents (Research, Analytics, Communication, Coordinator)
- **LangChain & LangGraph**: Advanced AI workflow orchestration
- **OpenAI GPT-4 Integration**: Large language model capabilities
- **Pinecone Vector Database**: Semantic search and knowledge retrieval
- **RAG Architecture**: Retrieval-Augmented Generation for accurate responses
- **Predictive Analytics**: Churn prediction and business intelligence

## Project Structure

```
miniCrmProgect/
├── backend/          # NestJS API server
│   ├── src/
│   │   ├── auth/     # Authentication module
│   │   ├── client/   # Client module
│   │   ├── invoice/  # Invoice module
│   │   ├── prisma/   # Prisma service
│   │   └── ...
│   ├── prisma/       # Database schema
│   └── package.json
├── frontend/         # Next.js web application
│   ├── src/
│   │   ├── app/      # App Router pages
│   │   ├── components/ # React components
│   │   └── styles/   # CSS styles
│   └── package.json
└── docker/          # Docker configuration
        └── docker-compose.yml
```

## Quick Start

### Prerequisites:
- Docker and Docker Compose installed
- Node.js (version 20+) for frontend development
- npm package manager

### Running the Project:

1. **Start Backend Services (Database + API):**
     ```bash
     cd docker
     docker-compose up -d
     ```
     This will start:
     - PostgreSQL database on port 5432
     - Redis cache on port 6379  
     - NestJS backend API on port 8080

2. **Start Frontend:**
     ```bash
     cd frontend
     npm install
     npm run dev
     ```
     Frontend will be available at http://localhost:3000

3. **Access the Application:**
     - Frontend: http://localhost:3000
     - Backend API: http://localhost:8080
     - Database: postgresql://admin:admin123@localhost:5432/new_crm

### Development Commands:

```bash
# Check backend services status
cd docker && docker-compose ps

# View backend logs
cd docker && docker-compose logs -f backend

# Stop all services
cd docker && docker-compose down

# Rebuild backend after changes
cd docker && docker-compose up --build -d backend
```

## Architecture

### Backend Services:
- **API Server**: NestJS application with TypeScript
- **Database**: PostgreSQL 15 with Prisma ORM
- **Cache**: Redis for session management
- **Authentication**: JWT tokens with bcrypt password hashing

### Security Features:
- JWT tokens stored in httpOnly cookies
- Passwords hashed using bcrypt
- Input validation through class-validator
- Protected routes through JWT Guards
- CORS configuration for frontend integration

## Project Status

**Currently Running:**
- Backend API: http://localhost:8080
- Frontend App: http://localhost:3000
- Database: PostgreSQL on port 5432
- Cache: Redis on port 6379

**Completed Features:**
- User authentication system
- Client management CRUD operations
- Invoice creation and management
- JWT-based security
- Docker containerization
- **AI Backend Infrastructure**: Complete multi-agent AI system
- **Research Agent**: Semantic search and knowledge retrieval
- **Analytics Agent**: Sentiment analysis and predictive modeling
- **Communication Agent**: AI-powered response generation
- **Coordinator Agent**: Intelligent workflow orchestration

**In Development:**
- AI-powered analytics
- Advanced reporting
- Email notifications
- Payment integration
- **AI Frontend Interface**: Web UI for AI agents (planned)

**Known Limitations:**
- AI functionality currently only available via API
- Frontend lacks AI interface components
- Requires OpenAI and Pinecone API keys for full functionality

## Troubleshooting

### AI System Issues

#### Pinecone Connection Issues:
```bash
# Check Pinecone connection
curl -X POST http://localhost:8080/research/test-pinecone
```

#### OpenAI API Issues:
- Verify `OPENAI_API_KEY` is set correctly
- Check API quota and billing status
- Ensure model names are valid (`gpt-4o-mini`, `text-embedding-3-small`)

#### Database Connection Issues:
```bash
# Test database connection
curl -X POST http://localhost:8080/auth/test-db
```

#### Common AI Errors:
- **"Pinecone connection failed"**: Check API key and network connectivity
- **"OpenAI API error"**: Verify API key and quota limits
- **"No response from AI agent"**: Check agent endpoints and request format

### Performance Optimization

#### AI Response Times:
- Research queries: 2-5 seconds (includes vector search)
- Analytics requests: 3-8 seconds (complex analysis)
- Communication generation: 2-4 seconds (context integration)

#### Caching Strategy:
- Redis used for session management
- Vector embeddings cached in Pinecone
- Database query results cached for repeated requests

## Contributing

### AI Development Guidelines:
1. **Agent Isolation**: Each agent should be independently testable
2. **Error Handling**: Implement comprehensive error handling for AI services
3. **Logging**: Add detailed logging for AI operations
4. **Testing**: Include unit tests for AI functionality
5. **Documentation**: Document all AI endpoints and their parameters

### Code Quality:
- Use TypeScript interfaces for all AI data structures
- Implement proper error handling for external API calls
- Add validation for AI-generated content
- Follow LangChain best practices for agent development

## Roadmap

### Phase 1: Core AI Infrastructure
- Multi-agent system implementation
- Basic AI integrations (OpenAI, Pinecone)
- RESTful API endpoints for all agents

### Phase 2: Advanced AI Features
- **Frontend AI Interface**: Web UI for interacting with AI agents
- **Real-time Communication**: WebSocket integration for live AI chat
- **Advanced Analytics Dashboard**: Visual analytics with AI insights
- **Email Integration**: Automated email campaigns with AI content

### Phase 3: Enterprise Features
- **Multi-tenant Architecture**: Support for multiple organizations
- **Advanced Security**: AI content moderation and safety filters
- **Custom AI Models**: Fine-tuned models for specific business domains
- **Integration APIs**: Third-party CRM and business tool integrations

### Phase 4: AI Automation
- **Workflow Automation**: Fully automated business processes
- **Predictive Actions**: AI-driven proactive business recommendations
- **Voice Integration**: Voice-based AI assistants
- **Mobile AI Apps**: Native mobile applications with AI features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

# Mini CRM Project

## Project Description

Mini CRM is a simple Customer Relationship Management system designed for freelancers and small teams. The project consists of two parts: a backend API built with NestJS and a frontend web application built with Next.js.

## Features

### Core Functionality:
- User authentication (registration/login)
- Client management (add, view, delete)
- Invoice management (create, track payments)
- Dashboard with metrics and analytics
- Protected routes with JWT authorization

## Technology Stack

### Backend:
- **NestJS** - Node.js framework
- **Prisma** - Database ORM
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **TypeScript** - Static typing

### Frontend:
- **Next.js 15** - React framework
- **TypeScript** - Static typing
- **Tailwind CSS** - CSS framework
- **Lucide React** - Icons

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

## Development

### Security:
- JWT tokens stored in httpOnly cookies
- Passwords hashed using bcrypt
- Input validation through class-validator
- Protected routes through JWT Guards

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**mikamika06** - [GitHub Profile](https://github.com/mikamika06)

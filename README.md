# MERN Test - Agent Management System

A complete **MERN Stack** application for managing agents and distributing CSV lists among them.

## 🚀 Quick Start

```bash
# 1. Extract and install dependencies
npm run install-deps

# 2. Start both servers
# Backend
npm run dev
# Frontend
npm start

# 3. Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

## ✨ Features

- ✅ **JWT Authentication** - Secure admin login system
- ✅ **Agent Management** - Complete CRUD operations for agents
- ✅ **CSV Distribution** - Upload CSV files and auto-distribute among 5 agents
- ✅ **Modern UI** - Professional React interface with responsive design
- ✅ **File Upload** - Support CSV, XLSX, XLS files (up to 10MB)
- ✅ **Real-time Feedback** - Toast notifications and loading states
- ✅ **Form Validation** - Comprehensive client and server-side validation
- ✅ **Security Features** - Rate limiting, CORS, helmet protection

## 🔧 Pre-configured Settings

- **JWT Secret**: Development key included
- **File Upload Limits**: 10MB maximum, CSV/XLSX/XLS formats supported
- **CORS**: Enabled for localhost:3000
- **Security**: Rate limiting and validation included

## 📊 CSV File Format

**Required columns:**
- **FirstName** - Contact's first name
- **Phone** - Contact's phone number

**Optional columns:**
- **Notes** - Additional information

The system automatically distributes CSV items equally among up to 5 active agents. If items don't divide evenly, remaining items are distributed sequentially.

## 🛠️ Tech Stack

**Backend Technologies:**
- Node.js - JavaScript runtime
- Express.js - Web framework
- MongoDB - NoSQL database
- JWT - Authentication tokens
- Multer - File upload handling
- bcryptjs - Password encryption

**Frontend Technologies:**
- React.js 18 - UI library with hooks
- React Router - Client-side routing
- React Hook Form - Form handling
- Axios - HTTP client
- Lucide React - Modern icons
- CSS3 - Custom styling

## 🔒 Security Features

- JWT token-based authentication
- Password encryption with bcryptjs
- Input validation and sanitization
- Rate limiting protection
- CORS configuration
- File type and size validation
- Secure headers with Helmet.js

## 📝 Usage Instructions

### First-Time Setup
1. Access the application at http://localhost:3000
2. Create an admin account using the registration form
3. Login with your admin credentials

### Agent Management
1. Navigate to the Agents section
2. Click "Add New Agent" to create agents
3. Fill in required fields: Name, Email, Mobile (+country code), Password
4. Manage agents: activate/deactivate, edit, or delete

### CSV Upload & Distribution
1. Go to Lists section and click "Upload CSV"
2. Select a CSV file with the required format
3. The system automatically distributes items among active agents
4. View distribution results and assigned items per agent

## 🚀 Deployment Ready

This application is production-ready with:
- Environment configuration for development and production
- Error handling and logging
- Database connection management
- Security best practices
- Scalable folder structure

Built with modern development practices and clean code architecture.

# Learner Application

## Overview
Learner is a chat application that allows users to interact with AI-enhanced topics through the NotebookLM Public API. The application features admin topic management and user chat functionality with persistent chat history.

## User Management

### Admin Authentication
- Admin can log in to access administrative features
- Admin has full control over topic management

### User Authentication  
- Users can register and log in using only their full name
- No password or email required for user accounts

## Topic Management

### Admin Features
- Create new topics with associated notebook UUIDs
- Edit existing topics and their notebook configurations
- Delete topics when no longer needed
- Each topic acts as a separate chat environment linked to a NotebookLM notebook

## Chat Functionality

### User Chat Interface
- Users can select from available topics to join chat sessions
- Real-time chat interface for sending messages and receiving responses
- Display both user messages and AI-enhanced responses in chat history

### Backend API Proxy
- Backend canister provides a proxy method for NotebookLM API calls
- Proxy method forwards chat requests to external NotebookLM API at `https://ai-proxy.hdev.rw/api/v1/chat`
- Required parameters for proxy method:
  - `notebook_id`: linked to the selected topic
  - `prompt`: user's chat message
  - `enhance`: set to true
- Optional X-API-Key header support for authentication in backend proxy
- Frontend makes HTTPS calls only to the backend canister proxy method

### Response Handling
- Backend proxy handles external API communication and returns responses to frontend
- Store both original and enhanced responses from the API
- Handle API errors gracefully with user-friendly messages for:
  - 400 (Bad Request)
  - 401 (Unauthorized) 
  - 503 (Service Unavailable)
  - 504 (Gateway Timeout)
- Display appropriate error messages when NotebookLM service is unavailable

## Data Persistence

### Backend Storage
- Store all topics with their associated notebook UUIDs
- Persist complete chat history for each user per topic
- Maintain user registration data (full names)
- Store both original and enhanced API responses

### Chat History
- Users can revisit any topic to view their complete chat history
- Chat sessions are permanently saved and accessible across login sessions

## User Interface

### Admin Dashboard
- Topic management interface for creating, editing, and deleting topics
- Configuration panel for notebook UUID assignment
- Optional API key management interface

### User Dashboard
- Display all available topics for selection
- Access to personal chat history across all topics
- Topic selection interface to join chat sessions

### Chat Interface
- Clean chat layout showing conversation flow
- Clear distinction between user messages and AI responses
- Message input field with send functionality
- Error message display for API failures and service unavailability
- All content displayed in English language

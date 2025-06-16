# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm install` - Install dependencies (run from root, installs all workspaces)
- `cd backend && npm run dev` - Start backend development server
- `cd frontend && npm run dev` - Start frontend development server  
- `npm run build` - Build frontend for production
- `npm run lint` - Lint frontend code

### Database
- `cd backend && npx prisma migrate dev --name <name>` - Create and apply database migration
- `cd backend && npx prisma generate` - Generate Prisma client
- `cd backend && npm run seed` - Seed database with sample data

### Backend Jobs
- Background jobs run automatically when backend starts
- Jobs are managed by pg-boss and handle audio transcription and OASIS form generation

## Architecture

This is a monorepo with three workspaces:
- `frontend/` - React + Vite + TypeScript UI using shadcn/ui components
- `backend/` - Node.js Express API with Prisma ORM and PostgreSQL
- `shared/` - Common types and utilities shared between frontend and backend

### Core Workflow
1. User uploads audio file through frontend
2. Backend stores audio and creates Note record with PENDING status
3. pg-boss jobs process the audio:
   - `transcribe` job: Uses OpenAI Whisper to transcribe audio
   - `generate` job: Uses OpenAI GPT to extract OASIS G & GG form data from transcript
4. Real-time updates sent to frontend via Socket.IO
5. Nurse reviews and edits generated forms in UI

### Key Models
- `Patient` - Patient demographics and MRN
- `Note` - Audio file, transcript, and OASIS form data for a patient encounter
- OASIS forms defined in `shared/oasis/` with detailed field definitions

### Socket.IO Integration
- Backend exposes WebSocket at `/ws` path
- Frontend connects to receive real-time job status updates
- Rooms organized by patient ID for targeted updates

### Environment Setup
Backend requires `.env` with:
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key for transcription and generation
- `PORT` - Server port (default 4000)
- `AUDIO_STORAGE_PATH` - File upload directory (default ./uploads)
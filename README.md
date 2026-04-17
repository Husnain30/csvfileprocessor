CSV Product Processing System
Overview

This project is a full-stack system that allows users to upload CSV files, process the data asynchronously, and view structured results through a web interface.

It simulates a real-world scenario involving file uploads, large dataset handling, background processing, and dynamic data visualization.

Tech Stack
Frontend: Next.js, TailwindCSS
Backend: Next.js API Routes
Data Processing: Python
Database: PostgreSQL
ORM: Prisma
Containerization: Docker

Features
1. CSV Upload
Upload product-related CSV files through a web interface
Stores metadata:
File name
Upload timestamp
Processing status
2. Dynamic CSV Handling
Automatically detects CSV headers
Works with different CSV formats (no fixed schema required)
Handles dynamic columns gracefully
3. Background Processing
CSV processing runs asynchronously using Python
Upload request does not block
Tracks processing states:
pending
processing
completed
failed

Processing tasks include:
Cleaning product names
Normalizing prices
Removing duplicates
Generating slugs

4. Data Storage
Processed data is stored as products in PostgreSQL
Designed flexible schema using Prisma
Handles:
Missing fields
Inconsistent data

5. AI Insights
Generates simple insights from uploaded data:
Dataset summary
Missing or inconsistent fields
Duplicate entries
Most common values (e.g. category)

6. Frontend Interface
Upload CSV files
View uploaded files and processing status
Display processed product data (dynamic table)
View AI-generated insights
Show statistics:
Total rows
Processed rows
Errors
System Architecture
User → Next.js Frontend → API Route → PostgreSQL Database
                                      ↓
                                 Python Worker
                                      ↓
                                Processed Data
Getting Started
1. Clone Repository
git clone https://github.com/husnain3010/csvfileprocessor.git
cd csv-product-system
2. Setup Environment Variables

Create a .env file:
DATABASE_URL="postgresql://postgres:******@localhost:5432/postgres"
3. Run with Docker
docker-compose up --build
4. Run Prisma Migrations
npx prisma migrate dev
5. Start Development Server
npm run dev
Project Structure
frontend/src/app            → Next.js frontend
frontend/src/app/api      → API routes
frontend/prisma         → Prisma schema
app/components     → UI components


Handling Large Files
Supports CSV files with at least 1000 rows
Uses background processing to prevent blocking
Efficient parsing and database insertion
AI Usage Explanation Tools Used ChatGPT for guidance, logic structuring, and debugging

Where AI Was Used
Designing system architecture
Writing CSV parsing logic
Handling edge cases (dynamic headers, missing values)
Generating insights logic
Example Prompts
"How to process large CSV files in Python efficiently?"
"How to design dynamic schema handling for CSV uploads?"
"Generate insights from tabular data using AI"


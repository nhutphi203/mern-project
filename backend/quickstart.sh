#!/bin/bash

# Quick Setup Script for Medical Record System
echo "🏥 Setting up Medical Record System..."

# 1. Install dependencies (if needed)
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    npm install
fi

# 2. Start MongoDB (if not running)
echo "🗄️  Checking MongoDB connection..."

# 3. Seed medical record data
echo "🌱 Seeding medical record data..."
npm run seed:medical

# 4. Start backend server
echo "🚀 Starting backend server..."
echo "Server will start on http://localhost:4000"
echo ""
echo "📖 Available endpoints:"
echo "  - POST /api/v1/login (Authentication)"
echo "  - GET  /api/v1/icd10/search (ICD-10 codes)"
echo "  - GET  /api/v1/medical-records/enhanced (Medical records)"
echo "  - POST /api/v1/cpoe/orders (CPOE orders)"
echo ""
echo "👥 Test users:"
echo "  - doctor@hospital.com / password123 (Doctor)"
echo "  - nurse@hospital.com / password123 (Nurse)"  
echo "  - admin@hospital.com / password123 (Admin)"
echo "  - patient@hospital.com / password123 (Patient)"
echo ""
echo "📄 Import Postman collection: MedicalRecordSystem.postman_collection.json"
echo "📚 Read full guide: USER_GUIDE.md"
echo ""

# Start server
npm start

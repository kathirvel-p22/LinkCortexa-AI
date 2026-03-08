#!/bin/bash
echo "🛡️ Starting LinkCortexa AI Development Environment..."
echo ""
echo "Starting backend on port 5000..."
cd backend && npm install && npm start &
BACKEND_PID=$!

sleep 3

echo "Starting frontend on port 3000..."
cd ../frontend && npm install && npm start &
FRONTEND_PID=$!

echo ""
echo "✅ LinkCortexa AI is starting up!"
echo "   Backend:   http://localhost:5000"
echo "   Dashboard: http://localhost:3000"
echo "   Health:    http://localhost:5000/health"
echo ""
echo "Press Ctrl+C to stop all services"
wait

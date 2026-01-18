#!/bin/bash
# Brahan Terminal Quick Start Script
# This script sets up and launches the Brahan Personal Terminal

echo "🏛️  BRAHAN PERSONAL TERMINAL - LAUNCHER"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed."
    echo "Please install Python 3.8 or higher from https://www.python.org/downloads/"
    exit 1
fi

echo "✓ Python found: $(python3 --version)"
echo ""

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed."
    echo "Please install pip: python3 -m ensurepip"
    exit 1
fi

echo "✓ pip found: $(pip3 --version)"
echo ""

# Check if virtual environment exists, create if not
if [ ! -d "venv_brahan" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv_brahan
    echo "✓ Virtual environment created"
    echo ""
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv_brahan/bin/activate

# Install/upgrade dependencies
echo "📚 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements_brahan.txt

echo "✓ All dependencies installed"
echo ""

# Launch dashboard
echo "🚀 Launching Brahan Terminal..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  The dashboard will open in your browser automatically"
echo "  URL: http://localhost:8501"
echo ""
echo "  Press Ctrl+C to stop the server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

streamlit run brahan_terminal.py

#!/bin/bash

# Well-Tegra GitHub Setup Script
# This script initializes the git repository and prepares it for pushing to GitHub

echo "=========================================="
echo "Well-Tegra GitHub Repository Setup"
echo "=========================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null
then
    echo "❌ Git is not installed. Please install Git first."
    echo "   Visit: https://git-scm.com/downloads"
    exit 1
fi

echo "✓ Git is installed"
echo ""

# Navigate to the project directory
cd "$(dirname "$0")"

# Check if .git already exists
if [ -d ".git" ]; then
    echo "⚠️  Git repository already initialized."
    echo "   To reinitialize, delete the .git folder first."
    echo ""
else
    # Initialize git repository
    echo "Initializing Git repository..."
    git init
    echo "✓ Repository initialized"
    echo ""
fi

# Add remote (if not already added)
if git remote | grep -q "origin"; then
    echo "✓ Remote 'origin' already configured"
else
    echo "Adding GitHub remote..."
    git remote add origin https://github.com/kenmck3772/welltegra.network.git
    echo "✓ Remote added"
fi
echo ""

# Show current status
echo "Current repository status:"
echo "=========================================="
git status
echo "=========================================="
echo ""

# Provide next steps
echo "Next Steps:"
echo "=========================================="
echo "1. Review the files listed above"
echo "2. Run: git add ."
echo "3. Run: git commit -m 'Initial commit - Well-Tegra v21'"
echo "4. Run: git branch -M main"
echo "5. Run: git push -u origin main"
echo ""
echo "Or simply run: ./quick-push.sh"
echo "=========================================="

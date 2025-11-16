#!/bin/bash

# Well-Tegra Quick Push Script
# Quickly commit and push all changes to GitHub

echo "=========================================="
echo "Well-Tegra Quick Push"
echo "=========================================="
echo ""

# Navigate to the project directory
cd "$(dirname "$0")"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not initialized."
    echo "   Run ./setup-git.sh first"
    exit 1
fi

# Show what's changed
echo "Files changed:"
echo "=========================================="
git status --short
echo "=========================================="
echo ""

# Ask for commit message
echo "Enter a commit message (or press Enter for default):"
read -r commit_message

# Use default message if none provided
if [ -z "$commit_message" ]; then
    commit_message="Update Well-Tegra project - $(date '+%Y-%m-%d %H:%M')"
fi

# Add all files
echo ""
echo "Adding files..."
git add .

# Commit
echo "Committing changes..."
git commit -m "$commit_message"

# Check if commit was successful
if [ $? -eq 0 ]; then
    echo "✓ Changes committed"
    echo ""
    
    # Push to GitHub
    echo "Pushing to GitHub..."
    git push
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "=========================================="
        echo "✓ Successfully pushed to GitHub!"
        echo "=========================================="
        echo ""
        echo "View your repository at:"
        echo "https://github.com/kenmck3772/welltegra.network"
        echo ""
        if git remote -v | grep -q "github.io"; then
            echo "View your live site at:"
            echo "https://kenmck3772.github.io/welltegra.network/"
        fi
    else
        echo ""
        echo "❌ Failed to push to GitHub"
        echo "   You may need to pull changes first: git pull"
        echo "   Or set up authentication: https://docs.github.com/en/authentication"
    fi
else
    echo ""
    echo "⚠️  Nothing to commit or commit failed"
    echo "   Make sure you've made changes to your files"
fi

echo ""

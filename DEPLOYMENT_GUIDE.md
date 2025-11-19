# GitHub Deployment Guide

## Step-by-Step Instructions for Pushing Your Project to GitHub

### Prerequisites
- Git installed on your computer
- GitHub account created
- Repository created at: https://github.com/kenmck3772/welltegra.network

---

## Option 1: Using Command Line (Terminal/Git Bash)

### First Time Setup

1. **Navigate to your project folder**
   ```bash
   cd /path/to/welltegra.network
   ```

2. **Initialize Git repository**
   ```bash
   git init
   ```

3. **Add your GitHub repository as remote**
   ```bash
   git remote add origin https://github.com/kenmck3772/welltegra.network.git
   ```

4. **Add all files**
   ```bash
   git add .
   ```

5. **Create your first commit**
   ```bash
   git commit -m "Initial commit - Well-Tegra v21"
   ```

6. **Push to GitHub**
   ```bash
   git branch -M main
   git push -u origin main
   ```

### For Future Updates

After making changes to your files:

```bash
# Check what files changed
git status

# Add all changed files
git add .

# Or add specific files
git add index.html

# Commit with a descriptive message
git commit -m "Fixed syntax errors and improved UI"

# Push to GitHub
git push
```

---

## Option 2: Using GitHub Desktop (Easier for Non-Coders)

### First Time Setup

1. **Download and install GitHub Desktop**
   - Go to: https://desktop.github.com/
   - Download and install

2. **Sign in to GitHub**
   - Open GitHub Desktop
   - Click "File" → "Options" (Windows) or "GitHub Desktop" → "Preferences" (Mac)
   - Sign in with your GitHub account

3. **Clone your repository**
   - Click "File" → "Clone repository"
   - Find "kenmck3772/welltegra.network" in the list
   - Choose where to save it on your computer
   - Click "Clone"

4. **Copy your files**
   - Copy all files from the welltegra.network folder into the cloned repository folder
   - GitHub Desktop will automatically detect the changes

5. **Commit and push**
   - In GitHub Desktop, you'll see all the files listed
   - In the bottom left, write a commit message (e.g., "Initial commit - Well-Tegra v21")
   - Click "Commit to main"
   - Click "Push origin" at the top

### For Future Updates

1. Make changes to your files
2. Open GitHub Desktop
3. You'll see the changes listed
4. Write a description of what you changed
5. Click "Commit to main"
6. Click "Push origin"

---

## Option 3: Using GitHub Web Interface (No Software Needed)

### For Small Updates

1. Go to https://github.com/kenmck3772/welltegra.network
2. Click "Add file" → "Upload files"
3. Drag and drop your index.html file
4. Add a commit message
5. Click "Commit changes"

**Note**: This method is good for quick updates but not ideal for managing the full project.

---

## Enabling GitHub Pages (Free Website Hosting)

1. Go to your repository: https://github.com/kenmck3772/welltegra.network
2. Click "Settings" (top menu)
3. Click "Pages" (left sidebar)
4. Under "Source", select "main" branch
5. Click "Save"
6. Wait 1-2 minutes
7. Your site will be live at: `https://kenmck3772.github.io/welltegra.network/`

---

## Common Commands Reference

```bash
# Check status of files
git status

# See what changed
git diff

# Add specific file
git add filename.html

# Add all files
git add .

# Commit with message
git commit -m "Your message here"

# Push to GitHub
git push

# Pull latest changes from GitHub
git pull

# Create a new branch
git checkout -b new-feature

# Switch branches
git checkout main

# See commit history
git log
```

---

## Troubleshooting

### "Permission denied" error
- You may need to set up SSH keys or use a personal access token
- GitHub Help: https://docs.github.com/en/authentication

### "Merge conflict" error
- This happens when files were edited in two places
- Use GitHub Desktop to resolve conflicts visually
- Or ask for help!

### "Repository not found" error
- Check that you typed the URL correctly
- Make sure you have access to the repository

---

## Best Practices

1. **Commit often** - Make small, frequent commits with clear messages
2. **Write good commit messages** - Describe what changed and why
   - Good: "Fixed hookload gauge calculation error"
   - Bad: "fixed stuff"
3. **Pull before you push** - Always `git pull` before starting work
4. **Use branches** for big changes - Keep main branch stable
5. **Test before pushing** - Make sure everything works locally first

---

## Getting Help

- **GitHub Docs**: https://docs.github.com
- **Git Documentation**: https://git-scm.com/doc
- **GitHub Community**: https://github.community/

---

**Remember**: Git is a version control system that tracks changes. GitHub is the website where your code is stored. You use Git to send (push) your changes to GitHub.

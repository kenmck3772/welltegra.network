# WellTegra ML API - Easy Setup

This directory contains everything you need to set up the **welltegra-ml-api** repository on your local machine.

## Option 1: Quick Setup (Recommended)

```bash
# 1. Navigate to where you want to create the ml-api repo
cd ~

# 2. Clone the empty welltegra-ml-api repository
git clone https://github.com/kenmck3772/welltegra-ml-api.git
cd welltegra-ml-api

# 3. Download and extract the complete API files
curl -L https://raw.githubusercontent.com/kenmck3772/welltegra.network/main/ml-api-setup/ml-api-complete.tar.gz -o ml-api.tar.gz
tar -xzf ml-api.tar.gz --strip-components=1
rm ml-api.tar.gz

# 4. Review the files
ls -la

# 5. Commit and push
git config commit.gpgsign false  # Disable GPG signing if needed
git add -A
git commit -m "Initial commit: Production-ready GCP ML API"
git push -u origin main

# Done! ✅
```

## Option 2: Manual Setup from welltegra.network Repo

```bash
# 1. Clone welltegra.network repo (if you don't have it)
cd ~
git clone https://github.com/kenmck3772/welltegra.network.git
cd welltegra.network
git pull origin main

# 2. Extract the ML API files
cd ml-api-setup
tar -xzf ml-api-complete.tar.gz -C ~/
cd ~/welltegra-ml-api

# 3. Initialize git repository
git init
git remote add origin https://github.com/kenmck3772/welltegra-ml-api.git

# 4. Commit and push
git add -A
git commit -m "Initial commit: Production-ready GCP ML API"
git push -u origin main
```

## What You Get

Once set up, your `welltegra-ml-api/` directory will contain:

```
welltegra-ml-api/
├── main.py                  # Flask API (370 lines, 6 endpoints)
├── config.py                # Environment configuration
├── requirements.txt         # Python dependencies
├── Dockerfile               # Cloud Run deployment
├── README.md                # Documentation
├── DEPLOYMENT.md            # Deployment guide
├── LICENSE                  # MIT License
├── .gitignore              # Git exclusions
├── .gcloudignore           # Cloud deployment exclusions
├── .github/workflows/
│   └── deploy.yml          # CI/CD pipeline
└── tests/
    ├── __init__.py
    └── test_api.py         # Test suite
```

## Verify Setup

```bash
cd ~/welltegra-ml-api

# Check all files are present
ls -la

# View the README
cat README.md

# Check git status
git status

# Should show: "On branch main, nothing to commit"
```

## Next Steps

After pushing to GitHub:

1. **Install dependencies**: `pip install -r requirements.txt`
2. **Upload BigQuery data**: Run `welltegra.network/scripts/upload-to-bigquery.py`
3. **Deploy to Cloud Functions**: Follow DEPLOYMENT.md
4. **Update LinkedIn**: Add this project to your profile!

## Troubleshooting

**Problem**: tar command not found
```bash
# Install tar (Debian/Ubuntu)
sudo apt-get install tar

# Or use unzip instead
cd ~/welltegra.network/ml-api-setup
# Extract files manually
```

**Problem**: Can't access GitHub
```bash
# Check network connection
ping github.com

# Check git credentials
git config --global user.name "Ken McKenzie"
git config --global user.email "kenmck3772@users.noreply.github.com"
```

**Problem**: Permission denied
```bash
# Make sure you're in your home directory
cd ~
pwd  # Should show /home/wells or similar

# Check ownership
ls -la welltegra-ml-api/
```

## Files Included

- **ml-api-complete.tar.gz** (42 KB) - Complete ML API repository
- **setup-welltegra-ml-api.sh** - Alternative automated setup script
- **README.md** - This file

## Support

Questions? Check:
- **API Documentation**: welltegra-ml-api/README.md
- **Deployment Guide**: welltegra-ml-api/DEPLOYMENT.md
- **GitHub Issues**: https://github.com/kenmck3772/welltegra-ml-api/issues

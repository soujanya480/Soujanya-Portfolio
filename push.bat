@echo off
cd /d "%~dp0"

echo.
echo === Soujanya Portfolio: Auto Push ===
echo Repo: https://github.com/Soujanya809/soujanya-portfolio.git
echo.

git remote set-url origin https://github.com/Soujanya809/soujanya-portfolio.git
git add .
git status

git diff --cached --quiet
if %errorlevel%==1 (
  git commit -m "Update portfolio website"
) else (
  echo No new file changes to commit.
)

git branch -M main
git push -u origin main

if %errorlevel%==0 (
  echo.
  echo Push successful!
  echo Open: https://github.com/Soujanya809/soujanya-portfolio
  echo.
  echo To enable free hosting: GitHub repo -^> Settings -^> Pages
  echo Source: Deploy from branch  |  Branch: main  |  Folder: / (root)
  echo Site URL will be:
  echo https://soujanya809.github.io/soujanya-portfolio/
) else (
  echo.
  echo Push failed. Login with GitHub username + Personal Access Token.
  echo Create token: https://github.com/settings/tokens
)

pause

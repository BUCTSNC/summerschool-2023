Start-Process -FilePath "npx" -ArgumentList "tsc", "--watch"
Start-Process -FilePath "npx" -ArgumentList "nodemon", "dist/main.js"
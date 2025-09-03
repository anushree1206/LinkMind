Set-Location "c:\Users\shruthi keerthana\OneDrive\Desktop\LinkMind\backend"
$env:MONGODB_URI = "mongodb://localhost:27017/relationship-manager"
$env:JWT_SECRET = "your-secret-key-here-12345"
$env:NODE_ENV = "development"
$env:PORT = "5000"
Write-Host "Starting LinkMind Backend Server..."
Write-Host "MongoDB URI: $env:MONGODB_URI"
Write-Host "Port: $env:PORT"
node src/index.js

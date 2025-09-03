$backendPath = "c:\Users\shruthi keerthana\OneDrive\Desktop\LinkMind\backend"
Set-Location $backendPath
$env:MONGODB_URI = "mongodb://localhost:27017/relationship-manager"
$env:JWT_SECRET = "your-secret-key-here-12345"
$env:NODE_ENV = "development"
$env:PORT = "5000"
Write-Host "Starting LinkMind Backend Server..."
Write-Host "Port: 5000"
Write-Host "MongoDB: localhost:27017/relationship-manager"
Write-Host ""
node simple-start.js

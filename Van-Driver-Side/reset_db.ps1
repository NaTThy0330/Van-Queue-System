try {
    $mongoHost = if ($env:MONGO_HOST) { $env:MONGO_HOST } elseif ($env:DB_HOST) { $env:DB_HOST } else { "host.docker.internal" }
    $env:MONGO_URI="mongodb://$mongoHost:27018/vanbooking?directConnection=true"
    $env:MONGODB_URI="mongodb://$mongoHost:27018/vanbooking?directConnection=true"
    Write-Host "Resetting Database..."
    node backend/scripts/seed.js
    Write-Host "Database Reset and Seeded Successfully!"
    Write-Host "Test Driver: 0811111111 / Driver@123"
} catch {
    Write-Host "Error: Something went wrong. Make sure Docker is running!"
    Write-Host $_.Exception.Message
}
Read-Host -Prompt "Press Enter to exit"

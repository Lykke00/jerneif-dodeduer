$connectionString = "HOST=localhost;DB=jerneif;UID=username123;PWD=password123;PORT=5432;"
$context = "AppDbContext"

# Run EF Core scaffold
dotnet ef dbcontext scaffold `
    $connectionString `
    Npgsql.EntityFrameworkCore.PostgreSQL `
    --output-dir Models `
    --context-dir . `
    --context $context `
    --no-onconfiguring `
    --data-annotations `
    --force

# Run dotnet format
dotnet format

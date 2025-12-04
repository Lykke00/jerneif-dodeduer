#!/bin/bash

connectionString="HOST=localhost;DB=jerneif;UID=username123;PWD=password123;PORT=5432;"
context="DbContext"

dotnet ef dbcontext scaffold \
  $connectionString \
  Npgsql.EntityFrameworkCore.PostgreSQL \
  --output-dir Models \
  --context-dir . \
  --context $context \
  --no-onconfiguring \
  --data-annotations \
  --force
  
dotnet format
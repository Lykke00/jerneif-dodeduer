﻿FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /

#der skal ændringer til før den gider at commites igen

COPY . .

ARG PROJECT=Api.Rest/Api.Rest.csproj

RUN dotnet restore "$PROJECT" --verbosity normal

RUN dotnet build "$PROJECT" -c Release --no-restore --verbosity normal

RUN dotnet publish "$PROJECT" \
    -c Release \
    -o /app/publish \
    --no-build \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

RUN mkdir -p wwwroot/uploads

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Startup.dll"]
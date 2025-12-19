# JerneIF Dead Pigeons
[![Frontend](https://img.shields.io/badge/Frontend-Live-brightgreen)](https://leet.dk) [![API](https://img.shields.io/badge/API-Live-blue)](https://api.leet.dk) [![API Docs](https://img.shields.io/badge/API%20Docs-Swagger-green)](https://api.leet.dk/swagger) [![Deployment](https://img.shields.io/badge/Deployment-EasyPanel-orange)](https://easypanel.io)
[![Tests](https://github.com/lykke00/jerneif-dodeduer/actions/workflows/dotnet-test.yml/badge.svg?branch=main)](https://github.com/lykke00/jerneif-dodeduer/actions/workflows/dotnet-test.yml)



This is a third semester exam project made for JerneIF.

Developer: **Lykke00**

## About this project
This project is a web-based system for managing the “Dead Pigeons” lottery game used by Jerne IF to raise funds.
It replaces a manual process with digital tracking of players, boards, weekly games, and deposits.
Administrators manage players, approve payments, and enter winning numbers.
Players use a balance-based system to purchase and optionally repeat boards across games.
Both digital and physical participants are supported in the same game rounds.
Prize calculation and payouts remain a manual administrative responsibility.

## Architecture
The architecture is a simple 3-layered one with the following layers:

`Client ⇄ Api.Rest ⇄ Service ⇄ DataAccess`
- **Api.Rest**
    - Responsible for communication with the outside, communicates with the service layer. All input validations (*FluentValidation*) is also in this layer
- **Service**
    - Responsible for service methods, takes DTO as input, communicates with the DataAccess layer.
- **DataAccess**
    - Communicates with the database, holds scaffolded models+context and repositories.
- **Tests**
    - Ensures the system functions correctly using integration tests.

### CodeBase
`Backend` - C# using Entity Framework Core and a RESTful API.

`Frontend` - React Vite TypeScript, using tailwind and HeroUI.

`Database` - PostgreSQL 16.

## Environment and configuration

The application is split into a backend API and a frontend client.

### Backend
- Built with ASP.NET Core
- Tests performed with xUnit3 and Testcontainers
- Requires a PostgreSQL 16 database
- Configuration is handled via standard ASP.NET configuration files (*AppOptions*)
  and environment variables (e.g. connection strings, JWT settings)

### Frontend
- Built with React using Vite
- Environment-specific values are provided via Vite environment variables

No secrets or environment-specific values are committed to the repository.

### Database
The application uses **PostgreSQL 16**.

The database schema is defined in SQL and can be found here:
- https://github.com/Lykke00/jerneif-dodeduer/blob/main/server/DataAccess/database.sql
  
## Deployment

The application is deployed using **EasyPanel**.

The backend API and frontend client are hosted as separate services,
each running in its own containerized environment.

Live URLs are provided for demonstration purposes and may change.

Deployment configuration is environment-specific and not committed
to the repository.


## Features
The system focuses on production-ready functionality with no partially implemented features.

### Authentication & Sessions
- Passwordless login via email link  
- Secure verification flow  
- Access token refresh via refresh token  
- Logout with cookie invalidation  
- Retrieve currently authenticated user  

### Deposits & Balance Management
- Create deposits with:
  - Amount and MobilePay transaction ID  
  - Optional payment image upload  
- Admin approval workflow for deposits (*approve or decline*) 
- Personal deposit history for users  
- Full deposit overview for administrators  

### Games & Gameplay
- Create a new game for a week
- Close a game by entering:
    - 3 winner numbers, for example: 1-2-3
- Play active games by inputting:
    - 5-8 numbers within the range of 1-16, no duplicate numbers allowed
- View current and historical games
- View history of a specific game with information such as:
    - Total amount of money spent by users
    - Total amount of boards bought by users
    - All winners for that game
    - Export to: .csv, .pdf, .excel, .docx file

### User Boards (*For future play*)
- Create and deactivate game boards  
- View board history of autoplays such as:
    - Numbers
    - Amount of plays
    - Price per game
    - Created
    - History of when the autoplay was performed with a log

### Administration
- Create user with information:
    - First and lastname
    - Email
    - Phone number
    - Admin
- Activate or deactivate players
- Edit user

## API Overview
Overview of who can access what in the backend, this is checked by the JWT.

### Auth
| Method | Route               | Admin | Anonymous | User |
|-------:|---------------------|:-----:|:---------:|:----:|
| POST   | /api/auth/login     |  ✔    |    ✔      |  ✔   |
| POST   | /api/auth/verify    |  ✔    |    ✔      |  ✔   |
| POST   | /api/auth/refresh   |  ✔    |    ✔      |  ✔   |
| POST   | /api/auth/logout    |  ✔    |    ✔      |  ✔   |
| GET    | /api/auth/me        |  ✔    |    ✖      |  ✔   |

### Deposits
| Method | Route                              | Admin | Anonymous | User |
|-------:|------------------------------------|:-----:|:---------:|:----:|
| POST   | /api/deposit/create                |  ✖    |    ✖      |  ✔   |
| GET    | /api/deposit/deposits              |  ✖    |    ✖      |  ✔   |
| GET    | /api/deposit/all                   |  ✔    |    ✖      |  ✖   |
| POST   | /api/deposit/update-status/{id}    |  ✔    |    ✖      |  ✖   |

### Games
| Method | Route                              | Admin | Anonymous | User |
|-------:|------------------------------------|:-----:|:---------:|:----:|
| GET    | /api/game/current                  |  ✔    |    ✖      |  ✔   |
| GET    | /api/game/by-id                    |  ✔    |    ✖      |  ✔   |
| POST   | /api/game/play                     |  ✔    |    ✖      |  ✔   |
| POST   | /api/game/{id}/update              |  ✔    |    ✖      |  ✖   |
| POST   | /api/game/{id}/winners             |  ✔    |    ✖      |  ✖   |
| POST   | /api/game/create                   |  ✔    |    ✖      |  ✖   |
| GET    | /api/game/all                      |  ✔    |    ✖      |  ✖   |
| GET    | /api/game/details                  |  ✔    |    ✖      |  ✖   |

### User boards
| Method | Route                                   | Admin | Anonymous | User |
|-------:|-----------------------------------------|:-----:|:---------:|:----:|
| GET    | /api/userboard/all                      |  ✔    |    ✖      |  ✔   |
| POST   | /api/userboard/create                   |  ✔    |    ✖      |  ✔   |
| POST   | /api/userboard/deactivate/{id}          |  ✔    |    ✖      |  ✔   |
| GET    | /api/userboard/{id}/history             |  ✔    |    ✖      |  ✔   |

### Users (Admin Only)
| Method | Route                     | Admin | Anonymous | User |
|-------:|---------------------------|:-----:|:---------:|:----:|
| GET    | /api/user/all             |  ✔    |    ✖      |  ✖   |
| POST   | /api/user/create          |  ✔    |    ✖      |  ✖   |
| POST   | /api/user/{id}/update     |  ✔    |    ✖      |  ✖   |

### Responses
All responses are streamlined to be easier to handle in the frontend.

Example of a successful response:
```
{
    "success": true,
    "value": {
        "id": "XXXXXXXX-XXXX-44ee-8068-9cb23ff51229",
        "week": 51,
        "year": 2025,
        "winningNumbers": [],
        "createdAt": "2025-12-19T09:07:38.207213Z"
    },
    "statusCode": 200,
    "errors": {}
}
```

Example of an error:
```
{
    "success": false,
    "value": false,
    "statusCode": 404,
    "errors": {
        "user": [
            "Brugeren eksisterer ikke."
        ]
    }
}
```

## Formatting and linting

Code quality and readability are enforced through a combination of formatting tools
and strict TypeScript compiler checks.

### Frontend

- **Prettier**
  - Used for consistent formatting and indentation
  - Configuration located in `/client/.prettierrc`

- **TypeScript strict mode**
  - Enforces strong type safety and early error detection
  - Includes rules such as:
    - No unused locals or parameters
    - No fallthrough cases in switch statements
    - Strict type checking

### IDE support

- **JetBrains Rider**
  - Provides built-in code inspections and static analysis
  - Helps detect unused code, type issues, and style problems during development


## Known bugs
- Occasional double-fetching caused by React re-renders.
  Can be resolved by memoizing callbacks using `useCallback`.

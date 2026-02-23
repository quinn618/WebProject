#sequenceDiagram

participant User
participant Browser
participant Server
participant Database

User->>Browser: Enter email, password, code
Browser->>Server: Send login request
Server->>Database: Check user credentials
Database-->>Server: User data

Server-->>Browser: Login success / failure
Browser-->>User: Redirect to dashboard

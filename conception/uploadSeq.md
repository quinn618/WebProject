sequenceDiagram

participant User
participant Browser
participant Server
participant Database
participant Storage

User->>Browser: Select file + info
Browser->>Server: Upload request
Server->>Storage: Save file
Server->>Database: Save metadata
Database-->>Server: Confirmation

Server-->>Browser: Upload success
Browser-->>User: Show confirmation

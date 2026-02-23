```mermaid
flowchart TD

Start --> OpenSite[Open Ghassra Platform]

OpenSite --> Logged{User logged in?}

Logged -- No --> LoginPage[Go to Login / Register]
LoginPage --> Auth{Credentials valid?}

Auth -- No --> LoginPage
Auth -- Yes --> Dashboard

Logged -- Yes --> Dashboard[Access Dashboard]

Dashboard --> Browse[Browse Filieres & Subjects]
Browse --> SelectDoc[Select Document]

SelectDoc --> Free{Document free?}

Free -- Yes --> Download[Download Document]
Free -- No --> Buy[Purchase Document]
Buy --> Download

Dashboard --> UploadChoice{Upload document?}
UploadChoice -- Yes --> Upload[Upload File]
UploadChoice -- No --> End

Download --> End
Upload --> End
```

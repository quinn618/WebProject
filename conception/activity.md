flowchart TD

Start --> LoginCheck{User logged in?}

LoginCheck -- No --> Login
LoginCheck -- Yes --> SelectDoc[Select Document]

SelectDoc --> FreeCheck{Is document free?}

FreeCheck -- Yes --> Download
FreeCheck -- No --> Purchase[Process Purchase]

Purchase --> Download

Download --> End

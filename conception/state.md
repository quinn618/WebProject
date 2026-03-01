mermaid
'''
stateDiagram-v2
    [*] --> Uploadé
    Uploadé --> EnAttenteValidation: Utilisateur uploade
    
    state EnAttenteValidation {
        [*] --> EnRevue
        EnRevue --> Approuvé: Admin valide
        EnRevue --> Rejeté: Admin rejette
    }
    
    Approuvé --> Disponible
    Rejeté --> [*]
    
    state Disponible {
        [*] --> Consultable
        Consultable --> Téléchargé: Utilisateur télécharge
        Consultable --> Acheté: Utilisateur achète
        Téléchargé --> DansBibliothèque
        Acheté --> DansBibliothèque
        DansBibliothèque --> Ouvert: Utilisateur ouvre
        Ouvert --> DansBibliothèque: Utilisateur ferme
    }
    
    Disponible --> Supprimé: Admin supprime
    Supprimé --> [*]
'''

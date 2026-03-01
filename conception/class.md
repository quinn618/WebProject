```mermaid
classDiagram
class Utilisateur {
    +int id
    +string nom
    +string email
    +string mot_de_passe
    +string code_institut
    +enum rôle {étudiant, admin}
    +datetime date_inscription
    +float solde_portefeuille
    +sinscrire()
    +connecter()
    +deconnecter()
    +mettreAjourProfil()
    +uploadDocument()
    +telechargerDocument()
    +acheterDocument()
    +ouvrirDocument()
    +getMaBibliothèque()
    +ajouterAuPortefeuille()
    +getHistoriqueAchats()
}

class Filiere {
    +int id
    +string nom
    +string code
    +string description
    +getMatieres()
    +ajouterMatiere()
    +supprimerMatiere()
}

class Matiere {
    +int id
    +string nom
    +string code
    +string description
    +int filiere_id
    +getDocuments()
    +ajouterDocument()
    +supprimerDocument()
}

class Document {
    +int id
    +string titre
    +string description
    +string chemin_fichier
    +float prix
    +int utilisateur_id
    +int matiere_id
    +enum statut {en_attente, validé, rejeté}
    +int nb_telechargements
    +int nb_vues
    +float note_moyenne
    +datetime date_upload
    +string type_fichier
    +int taille_fichier
    +upload()
    +valider()
    +rejeter()
    +supprimer()
    +estGratuit()
    +getDetails()
    +incrementerNbTelechargements()
    +incrementerNbVues()
    +getFluxFichier()
}

class UtilisateurDocument {
    +int utilisateur_id
    +int document_id
    +enum type_acces {acheté, téléchargé, uploadé}
    +datetime date_acces
    +datetime derniere_ouverture
    +int nb_ouvertures
    +aAcces()
    +enregistrerOuverture()
    +getDerniereOuverture()
}

class Achat {
    +int id
    +int utilisateur_id
    +int document_id
    +datetime date_achat
    +float montant
    +enum statut {complété, remboursé}
    +creerAchat()
    +getHistoriqueAchats()
    +rembourserAchat()
    +accorderAcces()
}

class Notation {
    +int id
    +int utilisateur_id
    +int document_id
    +int note
    +string commentaire
    +datetime date_creation
    +creerNotation()
    +mettreAjourNotation()
    +supprimerNotation()
}

class VisualiseurDocument {
    +string type_visualiseur
    +array formats_supportés
    +initialiserVisualiseur()
    +rendreDocument()
    +streamerContenu()
    +gererNavigation()
    +suivreAnalytiques()
}

Filiere "1" --> "*" Matiere : contient
Matiere "1" --> "*" Document : possède
Utilisateur "1" --> "*" Document : uploade
Utilisateur "1" --> "*" Achat : effectue
Document "1" --> "*" Achat : acheté dans
Utilisateur "1" --> "*" Notation : donne
Document "1" --> "*" Notation : reçoit
Utilisateur "1" --> "*" UtilisateurDocument : a accès à
Document "1" --> "*" UtilisateurDocument : accessible par
UtilisateurDocument --> VisualiseurDocument : utilise
```

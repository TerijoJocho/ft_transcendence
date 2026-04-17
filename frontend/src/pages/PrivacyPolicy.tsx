function PrivacyPolicy() {
  return (
    <section className="max-w-4xl mx-auto p-6 text-black bg-white/90 rounded-lg shadow-sm">
      <h1 className="text-3xl font-semibold mb-4">Politique de confidentialité</h1>
      <p className="mb-4">
        ChessWar collecte uniquement les données nécessaires au fonctionnement du service
        (authentification, profil, parties d'échecs, messagerie et sécurité).
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Données collectées</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Données de compte (email, pseudo, mot de passe chiffré si applicable)</li>
        <li>Données de profil (avatar et préférences)</li>
        <li>Données de jeu (historique, résultats, statistiques)</li>
        <li>Données techniques de session (jetons, journaux de sécurité)</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Finalités du traitement</h2>
      <p>
        Ces données sont utilisées pour permettre la connexion, sécuriser les sessions,
        afficher les profils, faire fonctionner le jeu en ligne et la messagerie privée.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Conservation et sécurité</h2>
      <p>
        Les mots de passe sont protégés par hachage. Les données sont conservées pour la
        durée nécessaire au bon fonctionnement de la plateforme et à l'évaluation du projet.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Vos droits</h2>
      <p>
        Vous pouvez modifier vos informations de profil et demander la suppression de votre
        compte via l'application.
      </p>

      <p className="text-sm text-gray-600 mt-6">
        Dernière mise à jour: avril 2026.
      </p>
    </section>
  );
}

export default PrivacyPolicy;

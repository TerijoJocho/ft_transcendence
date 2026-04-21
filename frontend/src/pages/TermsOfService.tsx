function TermsOfService() {
  return (
    <section className="max-w-4xl mx-auto p-6 text-black bg-white/90 rounded-lg shadow-sm">
      <h1 className="text-3xl font-semibold mb-4">Conditions d'utilisation</h1>
      <p className="mb-4">
        En utilisant ChessWar, vous acceptez d'utiliser la plateforme de manière
        respectueuse et conforme aux règles de l'école 42 ainsi qu'aux lois applicables.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Utilisation du compte</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Vous êtes responsable des actions réalisées avec votre compte.</li>
        <li>Les informations transmises lors de l'inscription doivent être exactes.</li>
        <li>Il est interdit d'accéder aux données privées d'autres utilisateurs.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Comportements interdits</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Aucun harcèlement, abus ou contenu malveillant dans le chat.</li>
        <li>Aucune triche, tentative d'exploitation ou perturbation du service.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Disponibilité du service</h2>
      <p>
        ChessWar est un projet pédagogique. Certaines fonctionnalités peuvent évoluer
        pendant le développement et l'évaluation.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Suspension ou suppression</h2>
      <p>
        Un compte peut être limité ou supprimé en cas de non-respect grave des présentes
        conditions ou d'atteinte à la sécurité de la plateforme.
      </p>

      <p className="text-sm text-gray-600 mt-6">
        Dernière mise à jour: avril 2026.
      </p>
    </section>
  );
}

export default TermsOfService;

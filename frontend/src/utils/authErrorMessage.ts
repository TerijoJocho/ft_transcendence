type AuthErrorContext = "login" | "signup" | "twoFactor";

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error && typeof error.message === "string") {
    return error.message;
  }
  return "Erreur serveur";
}

function defaultMessage(context: AuthErrorContext): string {
  if (context === "signup") return "Inscription impossible pour le moment.";
  if (context === "twoFactor")
    return "Vérification 2FA impossible pour le moment.";
  return "Connexion impossible pour le moment.";
}

export function toAuthErrorMessage(
  error: unknown,
  context: AuthErrorContext,
): string {
  const rawMessage = extractErrorMessage(error);
  const message = rawMessage.toLowerCase();

  if (message.includes("failed to fetch")) {
    return "Impossible de joindre le serveur. Vérifie ta connexion.";
  }

  if (message.includes("invalid credentials")) {
    return "Email/pseudo ou mot de passe incorrect.";
  }

  if (
    message.includes("password is not strong enough") ||
    message.includes("isstrongpassword")
  ) {
    return "Le mot de passe est trop faible. Utilisez au moins 8 caracteres avec majuscule, minuscule, chiffre et symbole.";
  }

  if (message.includes("must be an email") || message.includes("isemail")) {
    return "Adresse email invalide.";
  }

  if (
    message.includes("should not be empty") ||
    message.includes("isnotempty")
  ) {
    if (context === "signup") {
      return "Tous les champs sont obligatoires.";
    }
    return "Un champ obligatoire est manquant.";
  }

  if (message.includes("invalid 2fa code")) {
    return "Code 2FA invalide.";
  }

  if (message.includes("too many failed attempts, retry in")) {
    const seconds = rawMessage.match(/retry in\s+(\d+)s/i)?.[1];
    if (seconds) {
      return `Trop de tentatives 2FA. Réessaie dans ${seconds}s.`;
    }
    return "Trop de tentatives 2FA. Réessaie un peu plus tard.";
  }

  if (message.includes("too many failed attempts")) {
    return "Trop de tentatives 2FA. Réessaie un peu plus tard.";
  }

  if (message.includes("2fa secret not found")) {
    return "Configuration 2FA introuvable. Reconnecte-toi puis réessaie.";
  }

  if (message.includes("pseudo already exists")) {
    return "Ce pseudo est déjà utilisé.";
  }

  if (message.includes("email already exists")) {
    return "Cet email est déjà utilisé.";
  }

  if (message.includes("user already exists")) {
    return "Un compte avec cet email ou ce pseudo existe déjà.";
  }

  if (message.includes("session expired")) {
    return "Session expirée. Reconnecte-toi.";
  }

  if (
    message.includes("login failed") ||
    message.includes("player not found")
  ) {
    if (context === "login") {
      return "Connexion refusée. Vérifie tes identifiants.";
    }
    if (context === "twoFactor") {
      return "Impossible de valider la 2FA pour le moment.";
    }
  }

  return defaultMessage(context);
}

export function extractAuthDebugMessage(error: unknown): string {
  return extractErrorMessage(error);
}

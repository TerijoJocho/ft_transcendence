const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidMail = (mail: string) => {
    const regex = new RegExp("^[a-zA-Z0-9_.-]+[@]{1}[a-z0-9]+[\.][a-z]+$");
    if (!regex.test(mail) || mail.length < 5 ) return false;
    return true;
  };
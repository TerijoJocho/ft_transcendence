function formatDate(strDate: string) {
    const [year, month, day] = strDate.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

export default formatDate;
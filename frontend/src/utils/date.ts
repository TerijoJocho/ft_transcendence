function formatDate(strDate: string) {
        const date = new Date(strDate);
        return (
            new Intl.DateTimeFormat('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).format(date)
        );
    }

export default formatDate;
interface TextSectionProps {
    title?: string;
    paragraph: string;
}

function TextSection({title, paragraph}: TextSectionProps) {
    return (
        <>
            <h2>{title}</h2>
            <p>{paragraph}</p>
        </>
    )
}

export default TextSection
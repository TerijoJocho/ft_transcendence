interface TextSectionProps {
    title?: string;
    paragraph: string;
}

function TextSection({title, paragraph}: TextSectionProps) {
    return (
        <>
            {title && <h2 className="text-5xl font-bold mb-4 text-blue-500">{title}</h2>}
            <p className="text-xl mb-8 text-gray-300">{paragraph}</p>
        </>
    )
}

export default TextSection
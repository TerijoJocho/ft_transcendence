interface HeaderProps {
    title: string;
    links?: {label: string, href: string}[];
}

function Header({title, links}: HeaderProps) {
    return(
        <>
            <div className="w-full flex m-1">
                <h1>{title}</h1>
                {links && links.map((e) => <a></a>)}
            </div>
        </>
    )

}

export default Header
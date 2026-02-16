
interface HeaderProps {
    title: string;
}

function Header({title}: HeaderProps) {
    return(
        <header>
            <div className="w-full p-6 title-style">
                <h1>{title}</h1>
            </div>
        </header>
    )

}

export default Header
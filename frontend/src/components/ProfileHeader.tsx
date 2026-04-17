export default function ProfileHeader({user}) {

    return(
        <section className="border rounded-full">
            {typeof user.avatarUrl === 'string' && (
                <img src={user.avatarUrl} alt={`${user.pseudo} avatar`} className="w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56 rounded-full object-cover"/>
            )}
        </section>
    )
}
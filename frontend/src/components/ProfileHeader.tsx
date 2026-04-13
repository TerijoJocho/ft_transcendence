export default function ProfileHeader({user}) {

    return(
        <section className="border rounded-full">
            {typeof user.avatarUrl === 'string' && (
                <img src={user.avatarUrl} alt={`${user.pseudo} avatar`} className="w-56 h-56 rounded-full object-cover"/>
            )}
        </section>
    )
}
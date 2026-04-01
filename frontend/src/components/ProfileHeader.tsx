import { useAuth } from "../auth/useAuth";

export default function ProfileHeader() {
    const {user} = useAuth();

    return(
        <section className="border rounded-full">
            {typeof user.avatar === 'string' && (
                <img src={user.avatar} alt={`${user.pseudo} avatar`} className="w-56 h-56 rounded-full object-cover"/>
            )}
        </section>
    )
}
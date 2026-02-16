import { faHouse, faGamepad, faChess } from '@fortawesome/free-solid-svg-icons'
import { faMessage } from '@fortawesome/free-regular-svg-icons'

const sideBarData = [
    {
        icon:faHouse,
        text: "Home",
        path: "/dashboard",
    },
    {
        icon:faGamepad,
        text: "Jouer",
        path: "/game",
    },
    {
        icon:faChess,
        text: "Tournoi",
        path: "/tournament",
    },
    {
        icon: faMessage,
        text: "Message",
        path: "/chat",
    }
];

export default sideBarData;
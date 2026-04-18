import { faHouse, faGamepad, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { faMessage } from "@fortawesome/free-regular-svg-icons";

export type FriendStatus = "ONLINE" | "BUSY" | "IN_GAME" | "AWAY" | "OFFLINE";

export const sideBarData = [
  {
    icon: faHouse,
    text: "Home",
    path: "/dashboard",
  },
  {
    icon: faGamepad,
    text: "Jouer",
    path: "/game",
  },
  {
    icon: faMessage,
    text: "Chat",
    path: "/chat",
  },
  {
    icon: faUserGroup,
    text: "Amis",
    path: "/friends"
  }
];
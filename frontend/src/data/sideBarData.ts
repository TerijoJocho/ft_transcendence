import { faHouse, faGamepad, faChess } from "@fortawesome/free-solid-svg-icons";
import { faMessage } from "@fortawesome/free-regular-svg-icons";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
export type FriendStatus = "online";

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
    icon: faChess,
    text: "Tournoi",
    path: "/tournament",
  },
  {
    icon: faMessage,
    text: "Chat",
    path: "/chat",
  },
];

export interface FriendData {
  id: number;
  pseudo: string;
  avatar: typeof faCircleUser;
  status: FriendStatus;
  elo: number;
}

export const friendsData: FriendData[] = [
  {
    id: 1,
    pseudo: "NovaFox",
    avatar: faCircleUser,
    status: "online",
    elo: 1240,
  },
  {
    id: 2,
    pseudo: "PixelRook",
    avatar: faCircleUser,
    status: "online",
    elo: 1385,
  },
  {
    id: 3,
    pseudo: "EchoLynx",
    avatar: faCircleUser,
    status: "online",
    elo: 1520,
  },
  {
    id: 4,
    pseudo: "ByteHawk",
    avatar: faCircleUser,
    status: "online",
    elo: 1660,
  },
  {
    id: 5,
    pseudo: "ZenPanda",
    avatar: faCircleUser,
    status: "online",
    elo: 1715,
  },
  {
    id: 6,
    pseudo: "KiraWave",
    avatar: faCircleUser,
    status: "online",
    elo: 1430,
  },
  {
    id: 7,
    pseudo: "RuneWolf",
    avatar: faCircleUser,
    status: "online",
    elo: 1595,
  },
  {
    id: 8,
    pseudo: "BlueOrbit",
    avatar: faCircleUser,
    status: "online",
    elo: 1320,
  },
  {
    id: 9,
    pseudo: "SableCat",
    avatar: faCircleUser,
    status: "online",
    elo: 1475,
  },
  {
    id: 10,
    pseudo: "ArcadeMint",
    avatar: faCircleUser,
    status: "online",
    elo: 1760,
  },
  {
    id: 11,
    pseudo: "VioletGrid",
    avatar: faCircleUser,
    status: "online",
    elo: 1880,
  },
  {
    id: 12,
    pseudo: "CometBee",
    avatar: faCircleUser,
    status: "online",
    elo: 1210,
  },
  {
    id: 13,
    pseudo: "QuasarJay",
    avatar: faCircleUser,
    status: "online",
    elo: 1645,
  },
  {
    id: 14,
    pseudo: "NeonFawn",
    avatar: faCircleUser,
    status: "online",
    elo: 1365,
  },
  {
    id: 15,
    pseudo: "OrbitBard",
    avatar: faCircleUser,
    status: "online",
    elo: 1735,
  },
  {
    id: 16,
    pseudo: "MangoKite",
    avatar: faCircleUser,
    status: "online",
    elo: 1280,
  },
  {
    id: 17,
    pseudo: "RubyGlitch",
    avatar: faCircleUser,
    status: "online",
    elo: 1910,
  },
  {
    id: 18,
    pseudo: "LumenCrow",
    avatar: faCircleUser,
    status: "online",
    elo: 1570,
  },
  {
    id: 19,
    pseudo: "FrostNeko",
    avatar: faCircleUser,
    status: "online",
    elo: 1450,
  },
  {
    id: 20,
    pseudo: "StellarOtter",
    avatar: faCircleUser,
    status: "online",
    elo: 1690,
  },
];

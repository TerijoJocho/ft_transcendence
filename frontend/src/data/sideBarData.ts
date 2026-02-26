import { faHouse, faGamepad, faChess } from '@fortawesome/free-solid-svg-icons';
import { faMessage } from '@fortawesome/free-regular-svg-icons';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
export type FriendStatus = 'online';

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
    }
];

export interface FriendData {
  id: number;
  pseudo: string;
  avatar: typeof faCircleUser;
  status: FriendStatus;
}

export const friendsData: FriendData[] = [
  { id: 1, pseudo: 'NovaFox', avatar: faCircleUser, status: 'online' },
  { id: 2, pseudo: 'PixelRook', avatar: faCircleUser, status: 'online' },
  { id: 3, pseudo: 'EchoLynx', avatar: faCircleUser, status: 'online' },
  { id: 4, pseudo: 'ByteHawk', avatar: faCircleUser, status: 'online' },
  { id: 5, pseudo: 'ZenPanda', avatar: faCircleUser, status: 'online' },
  { id: 6, pseudo: 'KiraWave', avatar: faCircleUser, status: 'online' },
  { id: 7, pseudo: 'RuneWolf', avatar: faCircleUser, status: 'online' },
  { id: 8, pseudo: 'BlueOrbit', avatar: faCircleUser, status: 'online' },
  { id: 9, pseudo: 'SableCat', avatar: faCircleUser, status: 'online' },
  { id: 10, pseudo: 'ArcadeMint', avatar: faCircleUser, status: 'online' },
  { id: 11, pseudo: 'VioletGrid', avatar: faCircleUser, status: 'online' },
  { id: 12, pseudo: 'CometBee', avatar: faCircleUser, status: 'online' },
  { id: 13, pseudo: 'QuasarJay', avatar: faCircleUser, status: 'online' },
  { id: 14, pseudo: 'NeonFawn', avatar: faCircleUser, status: 'online' },
  { id: 15, pseudo: 'OrbitBard', avatar: faCircleUser, status: 'online' },
  { id: 16, pseudo: 'MangoKite', avatar: faCircleUser, status: 'online' },
  { id: 17, pseudo: 'RubyGlitch', avatar: faCircleUser, status: 'online' },
  { id: 18, pseudo: 'LumenCrow', avatar: faCircleUser, status: 'online' },
  { id: 19, pseudo: 'FrostNeko', avatar: faCircleUser, status: 'online' },
  { id: 20, pseudo: 'StellarOtter', avatar: faCircleUser, status: 'online' },
];
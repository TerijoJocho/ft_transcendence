export type FriendView = {
  id: number;
  pseudo: string;
  status: string | null;
  avatarUrl: string | null;
  isFriend: boolean;
  friendshipStatus: string;
  isBlocked: boolean; //a enlever
  isFavFriend: boolean; // a enlever
};

export class FriendResponseDto {
  friendshipId!: number;
  id!: number;
  pseudo!: string;
  status: string | null;
  avatarUrl!: string | null;
  isFriend!: boolean;
  friendshipStatus!: string;
  level?: number;
  lose?: number;
}

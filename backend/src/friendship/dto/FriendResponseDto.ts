export type FriendView = {
  id: number;
  pseudo: string;
  status: string;
  avatarUrl: string | null;
  isFriend: boolean;
  isBlocked: boolean;
  isFavFriend: boolean;
};

export class FriendResponseDto {
  id!: number;
  pseudo!: string;
  avatarUrl!: string | null;
  isFriend!: boolean;
  isBlocked!: boolean;
  isFavFriend!: boolean;
}


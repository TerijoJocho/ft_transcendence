export type FriendView = {
  id: number;
  pseudo: string;
  status: string | null;
  avatarUrl: string | null;
  friendshipStatus: string;
};

export class FriendResponseDto {
  friendshipId!: number;
  id!: number;
  pseudo!: string;
  status: string;
  online: boolean;
  avatarUrl!: string | null;
  friendshipStatus!: string;
  level?: number;
  lose?: number;
}

import { FriendshipDto } from './create-friendship.dto';

export class UpdateFriendshipDto implements Partial<FriendshipDto> {
  userId?: number;
}

export type User = {
  id: string;
  name: string;
  hasVoted: boolean;
};

export type VoteValue = "1" | "2" | "3" | "5" | "8" | "13" | "?";

export type RoomState = {
  roomId: string;
  revealed: boolean;
  users: User[];
  votes: Record<string, VoteValue | null>;
};

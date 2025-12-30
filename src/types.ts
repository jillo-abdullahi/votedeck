export type VotingSystemId = 'fibonacci' | 'modified_fibonacci' | 'tshirts' | 'powers_2';

export type User = {
  id: string;
  name: string;
  hasVoted: boolean;
};

export type VoteValue = string;

export type RoomState = {
  id: string;
  name: string;
  votingSystem: VotingSystemId;
  revealed: boolean;
  users: User[];
  votes: Record<string, VoteValue | null>;
};

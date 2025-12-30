import type { RoomState } from "../types";

export const mockRoom: RoomState = {
  id: "ABC123",
  name: "Mock room",
  votingSystem: "fibonacci",
  revealed: false,
  users: [
    { id: "1", name: "Jay", hasVoted: false },
    { id: "2", name: "Alex", hasVoted: false },
    { id: "3", name: "Sam", hasVoted: false },
    { id: "4", name: "John", hasVoted: false },
    { id: "5", name: "Jane", hasVoted: false },
  ],
  votes: {
    "1": null,
    "2": null,
    "3": null,
    "4": null,
    "5": "13",
  },
};

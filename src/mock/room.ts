import type { RoomState } from "../types";

export const mockRoom: RoomState = {
  roomId: "ABC123",
  revealed: false,
  users: [
    { id: "1", name: "Jay", hasVoted: true },
    { id: "2", name: "Alex", hasVoted: true },
    { id: "3", name: "Sam", hasVoted: false },
  ],
  votes: {
    "1": "5",
    "2": "8",
    "3": null,
  },
};

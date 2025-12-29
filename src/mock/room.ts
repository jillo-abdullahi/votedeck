import type { RoomState } from "../types";

export const mockRoom: RoomState = {
  roomId: "ABC123",
  revealed: false,
  users: [
    { id: "1", name: "Jay", hasVoted: false },
    { id: "2", name: "Alex", hasVoted: false },
    { id: "3", name: "Sam", hasVoted: false },
    { id: "4", name: "John", hasVoted: false },
  ],
  votes: {
    "1": null,
    "2": null,
    "3": null,
    "4": null,
  },
};

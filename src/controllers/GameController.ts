import { User } from "../models/User";
import { InitialCards } from "../models/InitialCards";
import { createId } from "../shared/helpers";
import DBController from "./DBController";
import { Issue } from "../models/Issue";

export default {
  createGame: (user: User) => {
    user.id = createId();
    const gameId = createId();
    const newGame = {
      roomName: `Spring ${Object.getOwnPropertyNames(global.DB.games).length + 1}`,
      roomID: gameId,
      scramMuster: user,
      gameSettings: {
        scrumMasterAsPlayer: true,
        changingCardInRoundEnd: false,
        isTimerNeeded: false,
        scoreType: 'Story Point',
        scoreTypeShort: 'SP',
        roundTime: 120,
        timeOut: true,
        gameInProgress: false,
      },
      users: [user],
      issues: [],
      cards: InitialCards
    };

    DBController.addGame(newGame);

    return newGame;
  },
  deleteGame: (roomId: string) => {
    DBController.deleteGame(roomId);
  },
  addUser: (newUser: User, roomId): { user?: User, error?: string } => {
    if (!newUser.firstName) {
      return {error: "Username and room are required"}
    }
    if (!roomId) {
      return {error: "RoomId is required"}
    }
    newUser.id = createId();

    return DBController.addUser(newUser, roomId);
  },
  deleteUser: (userId: string, roomId: string): { users?: User[], error?: string } => {
    if (!roomId) {
      return {error: "RoomId is required"}
    }
    if (!userId) {
      return {error: "userId is required"}
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't delete user"}
    }

    return {users: DBController.deleteUser(userId, roomId)};

  },
  addIssue: (issue: Issue, roomId): { issue?: Issue, error?: string } => {
    console.log(issue)
    if (!issue.issueName) {
      return {error: "issue name is required"}
    }
    if (!roomId) {
      return {error: "RoomId is required"}
    }
    issue.id = createId();

    return DBController.addIssue(issue, roomId);
  },
  deleteIssue:(issueId: string, roomId: string): { issues?: Issue[], error?: string } => {
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    if (!issueId) {
      return {error: "IssueId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't delete issue"};
    }
    const issues = DBController.deleteIssue(issueId, roomId);

    return { issues };
  },
}
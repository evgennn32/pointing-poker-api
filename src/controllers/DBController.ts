import { GameRoomEntity } from "../models/GameRoomEntity";
import { User } from "../models/User";
import GameSettings from "../models/GameSettings";
import { Issue } from "../models/Issue";
import { Card } from "../models/Card";
import GameResult from "../models/GameResult";
import UserVoteResult from "../models/UserVoteResult";
import Round from "../models/Round";

const DBConroller = {
  initDB: () => {
    const DB: { games: { [key: string]: GameRoomEntity } } = {games: {}};
    global.DB = DB;
  },
  addGame: (game: GameRoomEntity) => {
    global.DB.games[game.roomID] = game;
    return game.roomID
  },
  deleteGame: (roomId: string): { success?: true; error?: string } => {
    if (global.DB.games[roomId] !== undefined) {
      delete global.DB.games[roomId];
      return {success: true};
    }
    else {
      return { error: "The game doesn't exist" };
    }
  },
  getGame: (roomId: string): GameRoomEntity => {
    return global.DB.games[roomId];
  },
  startGame: (roomId: string): void => {
    global.DB.games[roomId].gameSettings.gameInProgress = true;
  },
  getGameSettings: (roomId: string): GameSettings => {
   return  global.DB.games[roomId].gameSettings;
  },
  getGameResults: (roomId: string): GameResult[] => {
    return  global.DB.games[roomId].gameResults;
  },
  gameIsset: (gameId:string) => {
    return gameId in global.DB.games;
  },
  updateGameSettings: (settings: GameSettings, roomId) => {
    global.DB.games[roomId].gameSettings = settings;
    return {settings: global.DB.games[roomId].gameSettings};
  },
  updateGameName: (name: string, roomId) => {
    global.DB.games[roomId].roomName = name;
    return {game: global.DB.games[roomId]};
  },
  addUser: (user: User, roomID): {error?: string; user?: User} => {
    if(!global.DB.games[roomID]) {
      return {error: 'No such game'};
    }
    global.DB.games[roomID].users.push(user);
    return {user};
  },
  deleteUser: (userId: string, roomID: string):  User[] => {
    global.DB.games[roomID].users = global.DB.games[roomID].users.filter((user) => user.id !== userId);
    return global.DB.games[roomID].users;
  },
  getUsers: (roomID: string):  User[] => {
    return global.DB.games[roomID].users;
  },
  getUser: (roomID: string, userId: string):  User => {
    return global.DB.games[roomID].users.find(
      (user) => (user.id === userId)
    );
  },
  addIssue: (issue: Issue, roomID: string): {error?: string; issue?: Issue} => {
    if(!global.DB.games[roomID]) {
      return {error: 'No such game'};
    }
    global.DB.games[roomID].issues.push(issue);
    return {issue};
  },
  getIssues: (roomID: string) => {
    return global.DB.games[roomID].issues
  },
  updateIssue: (updatedIssue: Issue, roomID: string): {error?: string; issues?: Issue[]} => {
    if(!global.DB.games[roomID]) {
      return {error: 'No such game'};
    }
    global.DB.games[roomID].issues = global.DB.games[roomID].issues.map(
      (issue) => (issue.id === updatedIssue.id ? updatedIssue : issue)
    );
    return {issues: global.DB.games[roomID].issues};
  },
  deleteIssue: (issueId: string, roomId: string): Issue[] => {
    global.DB.games[roomId].issues = global.DB.games[roomId].issues.filter((issue) => issue.id !== issueId);
    return global.DB.games[roomId].issues;
  },
  addCard: (card: Card, roomID: string): {error?: string; card?: Card} => {
    if(!global.DB.games[roomID]) {
      return {error: 'No such game'};
    }
    global.DB.games[roomID].cards.push(card);
    return {card};
  },
  updateCard: (updatedCard: Card, roomID: string): {error?: string; cards?: Card[]} => {
    if(!global.DB.games[roomID]) {
      return {error: 'No such game'};
    }
    global.DB.games[roomID].cards = global.DB.games[roomID].cards.map(
      (card) => (card.id === updatedCard.id ? updatedCard : card)
    );
    return {cards: global.DB.games[roomID].cards};
  },
  deleteCard: (cardId: string, roomId: string): Card[] => {
    global.DB.games[roomId].cards = global.DB.games[roomId].cards.filter((card) => card.id !== cardId);
    return global.DB.games[roomId].cards;
  },
  getCardByValue: (roomId: string, cardValue: string): Card | null => {
    const filteredCards = global.DB.games[roomId].cards.filter((card) => card.value === cardValue);
    if(filteredCards.length){
      return filteredCards[0];
    }
    return;
  },
  roundCreate: (roomId: string, roundData: Round): {round?: Round; error?: string;} => {
    try {
      global.DB.games[roomId].rounds.push(roundData);
      return {round: roundData}
    } catch (e) {
      return {error: e.message}
    }
  },
  roundUpdate: (roomId: string, updatedRound: Round) => {
    global.DB.games[roomId].rounds = global.DB.games[roomId].rounds.map(
      (round) => (round.roundId === updatedRound.roundId ? updatedRound : round)
    );
    return DBConroller.getRound(roomId, updatedRound.roundId);
  },
  roundStart: (roomId: string, roundId: string): Round => {
    global.DB.games[roomId].rounds = global.DB.games[roomId].rounds.map(
      (round) => {
        if( round.roundId !== roundId) return round;
        round.usersVoteResults =  round.usersVoteResults.map(user => ({...user, score: null}));
        return {...round, roundInProgress: true};
      }
    );
    return DBConroller.getRound(roomId, roundId);
  },
  getRound: (roomId: string, roundId: string): Round | null => {
    return global.DB.games[roomId].rounds.find(round => (round.roundId === roundId));
  },
  roundExists: (roomId: string, roundId: string): boolean => {
    return global.DB.games[roomId].rounds.filter(round => (
      round.roundId === roundId
      )
    ).length > 0;
  },
  roundWithIssueExists: (roomId: string, issueId: string): Round | undefined => {
    return global.DB.games[roomId].rounds.find((round: Round) => (
        round.issueId === issueId
      )
    );
  },
  addUserVote:
    (
      roomId: string, roundId: string, userVoteResult: UserVoteResult
    ): {round?: Round; error?: string;} => {
    try {
      const round = DBConroller.getRound(roomId, roundId);
      const newResults = round.usersVoteResults.map((res): UserVoteResult => {
        return res.id === userVoteResult.id ? userVoteResult : res;
      })
      DBConroller.roundUpdate(roomId, {...round, usersVoteResults: newResults});
      const roundUpdated = DBConroller.getRound(roomId, roundId);
      return roundUpdated ? {round: roundUpdated} : {error: 'No round'};
    } catch (e) {
      return {error: e.message};
    }
  },
}

export default DBConroller

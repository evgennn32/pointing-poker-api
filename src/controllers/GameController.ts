import { User } from "../models/User";
import { InitialCards } from "../models/InitialCards";
import { createId } from "../shared/helpers";
import DBController from "./DBController";
import { Issue } from "../models/Issue";
import GameSettings from "../models/GameSettings";
import { Card } from "../models/Card";
import Round from "../models/Round";
import UserVoteResult from "../models/UserVoteResult";

const GameController =  {
  createGame: (user: User) => {
    user.id = createId();
    const gameId = createId();
    const newGame = {
      roomName: `Spring ${Object.getOwnPropertyNames(global.DB.games).length + 1}`,
      roomID: gameId,
      scrumMaster: user,
      gameSettings: {
        scrumMasterAsPlayer: true,
        changingCardInRoundEnd: false,
        isTimerNeeded: false,
        scoreType: 'Story Point',
        scoreTypeShort: 'SP',
        roundTime: 5,
        timeOut: true,
        gameInProgress: false,
      },
      gameResults: [],
      users: [user],
      issues: [],
      cards: InitialCards.map( card => ({...card, id: createId()})),
      rounds: [],
    };

    DBController.addGame(newGame);

    return newGame;
  },
  deleteGame: (roomId: string): { error?: string; success?: boolean } => {
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists"};
    }

    return DBController.deleteGame(roomId);
  },
  getGame: (roomId: string)  => {
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists"};
    }
    return {game: DBController.getGame(roomId)};
  },
  startGame: (roomId: string) => {
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't delete user"};
    }
    if(!GameController.gameHasIssues(roomId)) {
      return {error: "There are no issues to vote in the current game"};
    }
    try {
      DBController.startGame(roomId);
    } catch (e) {
      return {error: e.message};
    }
    try {
      return {gameSettings: DBController.getGameSettings(roomId)};
    } catch (e) {
      return {error: e.message};
    }
  },
  endGame: (roomId: string) => {
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't end game"};
    }
    const gameSettings = DBController.getGameSettings(roomId);
    DBController.updateGameSettings({ ... gameSettings, gameInProgress: false } , roomId);
    return {game: DBController.getGame(roomId)};
  },
  gameHasIssues: (roomId: string) => {
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't delete user"};
    }
   return DBController.getIssues(roomId).length;
  },
  updateGameSettings: (settings: GameSettings, roomId): {error?: string; settings?: GameSettings} => {
    if (!settings) {
      return {error: "Settings are required"};
    }
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't update settings"};
    }
    return DBController.updateGameSettings(settings, roomId);
  },
  addUser: (newUser: User, roomId: string): { user?: User, error?: string } => {
    if (!newUser.firstName) {
      return {error: "Username and room are required"};
    }
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    newUser.id = createId();

    return DBController.addUser(newUser, roomId);
  },
  getUsers:(roomId: string): { users?: User[], error?: string } => {
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't delete user"};
    }
    const users = DBController.getUsers(roomId);
    return {users};
  },
  getUser: (roomId: string, userId:string): { user?: User, error?: string } => {
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't get user"};
    }

    const user = DBController.getUser(roomId, userId);
  if (!user) {
    return {error: "No user with such id"};
  }
    return {user};
  },
  deleteUser: (userId: string, roomId: string): { users?: User[], error?: string } => {
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    if (!userId) {
      return {error: "userId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't delete user"};
    }

    return {users: DBController.deleteUser(userId, roomId)};

  },
  userVote: (
    roomId: string,
    roundId: string,
    userVoteResult: UserVoteResult): { round?: Round, error?: string }  => {
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    if (!roundId) {
      return {error: "roundId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't add vote"};
    }
    if (!DBController.roundExists(roomId, roundId)) {
      return {error: "This round no longer exists, can't add vote"};
    }
    return DBController.addUserVote(roomId, roundId, userVoteResult)

  },
  addIssue: (issue: Issue, roomId: string): { issue?: Issue, error?: string } => {
    if (!issue.issueName) {
      return {error: "issue name is required"};
    }
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    issue.id = createId();

    return DBController.addIssue(issue, roomId);
  },
  getIssues: (roomId): { issues?: Issue[], error?: string } => {
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't delete user"};
    }
    return { issues: DBController.getIssues(roomId) };
  },
  updateIssue: (issue: Issue, roomId): { issues?: Issue[], error?: string } => {
    if (!issue.issueName) {
      return {error: "issue name is required"};
    }
    if (!issue.id) {
      return {error: "issue id is required"};
    }
    if (!roomId) {
      return {error: "RoomId is required"};
    }

    return DBController.updateIssue(issue, roomId);
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
  addCard: (card: Card, roomId): { card?: Card, error?: string } => {
    if (!card.value) {
      return {error: "card value is required"};
    }
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    card.id = createId();

    return DBController.addCard(card, roomId);
  },
  updateCard: (card: Card, roomId): { cards?: Card[], error?: string } => {
    if (!card.value) {
      return {error: "card value is required"};
    }
    if (!card.id) {
      return {error: "card id is required"};
    }
    if (!roomId) {
      return {error: "RoomId is required"};
    }

    return DBController.updateCard(card, roomId);
  },
  deleteCard:(cardId: string, roomId: string): { cards?: Card[], error?: string } => {
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    if (!cardId) {
      return {error: "CardId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't delete card"};
    }
    const cards = DBController.deleteCard(cardId, roomId);

    return { cards };
  },
  getCardByValue: (roomId: string, cardValue ) => {
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    if (!cardValue) {
      return {error: "CardId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't get card"};
    }
    return DBController.getCardByValue(roomId, cardValue);

  },
  createInitialVoteResults: (roomId: string): UserVoteResult[] => {
    const gameSettings = DBController.getGameSettings(roomId);
    const users = DBController.getUsers(roomId);

    if (!users) {
      return [];
    }
    const usersAbleToVote = users.filter(
      (user) =>
        !user.scrumMaster &&
        !user.observer ||
        (user.scrumMaster && gameSettings.scrumMasterAsPlayer),
    );

    return usersAbleToVote.map(user => ({...user, score: null}));
  },
  createRoundInitialData: (issueId: string, roomId: string): Round => {
    return {
      roundId: createId(),
      issueId,
      roundInProgress: false,
      usersVoteResults: GameController.createInitialVoteResults(roomId),
      statistics: null,
      roundEnded: false,
    }
  },
  roundCreate: (issueId: string, roomId: string): { round?: Round, error?: string } => {
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    if (!issueId) {
      return {error: "issueId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't create round"};
    }
    const round = DBController.roundWithIssueExists(roomId, issueId);
    if (round) {
      return {round};
    }
    const roundInitialData = GameController.createRoundInitialData(issueId, roomId);
    return DBController.roundCreate( roomId, roundInitialData);
  },
  roundStart: (roundId: string, roomId: string): { round?: Round, error?: string } => {
    if (!roomId) {
      return {error: "roomId is required"};
    }
    if (!roundId) {
      return {error: "roundId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't start round"};
    }
    if(!DBController.roundExists(roomId, roundId)) {
      return {error: "No round with such id"};
    }
    const round = DBController.roundStart(roomId, roundId);

    return { round };
  },
  roundStop: (roundId: string, roomId: string): { round?: Round, error?: string } => {
    if (!roomId) {
      return {error: "roomId is required"};
    }
    if (!roundId) {
      return {error: "roundId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't stop round"};
    }
    if(!DBController.roundExists(roomId, roundId)) {
      return {error: "No round with such id"};
    }
    const round = DBController.getRound(roomId, roundId);
    const roundStopped = DBController.roundUpdate(
      roomId,
      {...round, roundInProgress: false, roundEnded:true },
    );
    const roundStatistics = []
    const calculatedStatistics = GameController.calculateRoundStatistics(roundStopped.usersVoteResults);
    for(let key in calculatedStatistics) {
      if (calculatedStatistics.hasOwnProperty(key)){
        const singleResult = {
          card: GameController.getCardByValue(roomId, key),
          value: calculatedStatistics[key],
        }
        roundStatistics.push(singleResult)
      }
    }
    roundStopped.statistics = roundStatistics;
    const roundWithStatistics = DBController.roundUpdate(roomId, roundStopped);

    return { round: roundWithStatistics };
  },
  roundRestart: (roundId: string, roomId: string): { round?: Round, error?: string } => {
    if (!roomId) {
      return {error: "roomId is required"};
    }
    if (!roundId) {
      return {error: "roundId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't restart round"};
    }
    const roundToReset = DBController.getRound(roundId, roomId);
    const round = GameController.createRoundInitialData(roundToReset.issueId, roundId);
    round.roundId = roundToReset.roundId;
    round.roundInProgress = true;

    return { round };
  },
  calculateRoundStatistics: (voteResults: UserVoteResult[]): any  => {
    const statistics = {}
    voteResults.forEach(result => {
      if (!result.score) {
        return statistics
      }

      if(statistics[result.score]) {
        statistics[result.score] += 1
      } else {
        statistics[result.score] = 1;
      }
    })
    for (let key in statistics) {
      const percentValue = statistics[key]*100/voteResults.length
      statistics[key] = `${percentValue.toFixed(1)}%`
    }

    return statistics;
  },
  updateRound: (round: Round, roomId): { round?: Round, error?: string } => {
    if (!round.roundId) {
      return {error: "Round id is required"};
    }
    if (!round.issueId) {
      return {error: "Issue id is required"};
    }
    return {round: DBController.roundUpdate(roomId, round)};
  },
}

export default GameController;

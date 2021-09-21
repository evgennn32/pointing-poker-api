# pointing-poker-api

Api for Rolling Scopes School task "Pointing-poker".

Setup and Running

- Use `node 14.x` or higher.
- Clone this repo: `$ git clone https://github.com/mikhama/async-race-api.git`.
- Go to downloaded folder: `$ cd async-race-api`.
- Install dependencies: `$ npm install`.
- Start server: `$ npm start`.
- Now you can send requests to the address: `http://127.0.0.1:4000`.

Usage

- **Game**
  - [Create Game](https://github.com/evgennn32/pointing-poker-api#create-game)
  - [Update Game Settings](https://github.com/evgennn32/pointing-poker-api#update-game-settings)
  - [Join Game](https://github.com/evgennn32/pointing-poker-api#join-game)
  - [Delete Game](https://github.com/evgennn32/pointing-poker-api#delete-game)
  - [Start Game](https://github.com/evgennn32/pointing-poker-api#start-game)
  - [End Game](https://github.com/evgennn32/pointing-poker-api#end-game)
  - **Rounds**
  - [Create Round](https://github.com/evgennn32/pointing-poker-api#create-round)
  - [Start Round](https://github.com/evgennn32/pointing-poker-api#update-round)
  - [Stop Round](https://github.com/evgennn32/pointing-poker-api#create-round)
  - [Restart Round](https://github.com/evgennn32/pointing-poker-api#update-round)
  - [Update Round](https://github.com/evgennn32/pointing-poker-api#update-round)
- **Users**
  - [Create User](https://github.com/evgennn32/pointing-poker-api#create-user)
  - [Delete User](https://github.com/evgennn32/pointing-poker-api#delete-user)
- **Issues**
  - [Create Issue](https://github.com/evgennn32/pointing-poker-api#create-issue)
  - [Delete Issue](https://github.com/evgennn32/pointing-poker-api#delete-issue)
  - [Update Issue](https://github.com/evgennn32/pointing-poker-api#update-issue)c
- **Cards**
  - [Create Card](https://github.com/evgennn32/pointing-poker-api#create-Card)
  - [Delete Card](https://github.com/evgennn32/pointing-poker-api#delete-Card)
  - [Update Card](https://github.com/evgennn32/pointing-poker-api#update-Card)

**Create Game**

Creates a new game.

<details>

- **Event**

  create:game

- **Params**

  ```typescript
    {
        "user": {
                  id: string;
                  image: string | null;
                  firstName: string;
                  lastName: string;
                  position: string;
                  ableToDelete: boolean;
                  score: string;
                  scramMaster: boolean;
                }
    }
  ```

- **Success event name**

  game:created

- **Success event data**

  ```typescript
    {
        "newGame": {
                    roomName: string;
                    roomID: string;
                    scramMuster: User,
                    gameSettings: GameSettings;
                    users: User[];
                    issues: Issue[];
                    cards: Card[];
                  }
    }
  ```

- **Success callback response**

  None

- **Error callback response:**

  None

- **Notes:**

  None

</details>

**Update Game Settings**

Update the game settings options.

<details>

- **Event**

  game:update-settings

- **Params**

  ```typescript
    {
        "gameSettings": {
                  scrumMasterAsPlayer: boolean;
                  changingCardInRoundEnd: boolean;
                  isTimerNeeded: boolean;
                  scoreType: string;
                  scoreTypeShort: string;
                  roundTime: number;
                  timeOut: boolean;
                  gameInProgress: boolean;
                },
         "roomId": string
    }
  ```

- **Success event name**

  None

- **Success event data**

  None

- **Success callback response**

  ```typescript
  {
    settings: {
      scrumMasterAsPlayer: boolean;
      changingCardInRoundEnd: boolean;
      isTimerNeeded: boolean;
      scoreType: string;
      scoreTypeShort: string;
      roundTime: number;
      timeOut: boolean;
      gameInProgress: boolean;
    }
  }
  ```

- **Error callback response:**

  ```typescript
  {
    error: string;
  }
  ```

- **Notes:**

  None

</details>

**Join Game**

Join existing game.

<details>

- **Event**

  game:join

- **Params**

  ```typescript
    {
        "roomId":string
    }
  ```

- **Success event name**

  None

- **Success event data**
  None

- **Success callback response**

  None

- **Error callback response:**

  ```typescript
  {
    error: "No such game or id is incorrect";
  }
  ```

- **Notes:**

  None

</details>

**Delete Game**

Delete existing game.

<details>

- **Event**

  game:delete

- **Params**

  ```typescript
    {
      "roomId": string
    }
  ```

- **Success event name**

  None

- **Success event data**

  ```typescript
       message: `Game with '${global.DB.games[roomId]}' id has been deleted`
     }

  ```

- **Success callback response**

  None

- **Error callback:**

  ```typescript
  {
    error: string;
  }
  ```

- **Notes:**

  None

</details>

**Start Game**

Start new game in the current room.

<details>

- **Event**

  game:start

- **Params**

  ```typescript
    {
        "roomId": string
    }
  ```

- **Success event name**

  game:start

- **Success event data**

  ```typescript
    {
        "gameSettings": {
                  scrumMasterAsPlayer: boolean;
                  changingCardInRoundEnd: boolean;
                  isTimerNeeded: boolean;
                  scoreType: string;
                  scoreTypeShort: string;
                  roundTime: number;
                  timeOut: boolean;
                  gameInProgress: boolean;
                }
    }

  ```

- **Success callback response**

  ```typescript
    {
        "success": true
    }
  ```

- **Error callback response:**

  ```typescript
  {
    error: string;
  }
  ```

- **Notes:**

  None

</details>

**End Game**

End running game in the current room.

<details>

- **Event**

  game:end

- **Params**

  ```typescript
    {
         "roomId": string
    }
  ```

- **Success event name**

  game:end

- **Success event data**
  ```typescript
  {
    "gameResults" {
      issue: Issue;
      voteResults: VoteResult[];
  }
  }
  ```
- **Success callback response**

  ```typescript
  {
    "gameResults" {
      issue: Issue;
      voteResults: VoteResult[];
  }
  }
  ```

- **Error callback:**

  ```typescript
  {
    error: string;
  }
  ```

- **Notes:**

  None

</details>

**Create Round**

Create game round in the current room.

<details>

- **Event**

  round:create

- **Params**

  ```typescript
    {
         "roomId": string,
         "issueId": string
    }
  ```

- **Success event name**

  round:new

- **Success event data**
  ```typescript
  {
    "round" {
  roundId: string;
  issueId: string;
  roundInProgress: boolean;
  usersVoteResults: UserVoteResult[];
  statistics: VoteResult | null;
  }
  }
  ```
- **Success callback response**

  ```typescript
  {
    "round" {
  roundId: string;
  issueId: string;
  roundInProgress: boolean;
  usersVoteResults: UserVoteResult[];
  statistics: VoteResult | null;
  }
  }
  ```

- **Error callback:**

  ```typescript
  {
    error: string;
  }
  ```

- **Notes:**

  None

</details>

**Update Round**

Update game round in the current room.

<details>

- **Event**

  round:update

- **Params**

  ```typescript
    {
         "roomId": string,
         "roundToUpdate": {
              roundId: string;
              issueId: string;
              roundInProgress: boolean;
              usersVoteResults: UserVoteResult[];
              statistics: VoteResult | null;
         }
    }
  ```

- **Success event name**

  None

- **Success event data**
  None
- **Success callback response**

  ```typescript
  {
    "rounds": Round[]
  }
  ```

- **Error callback:**

  ```typescript
  {
    error: string;
  }
  ```

- **Notes:**

  None

</details>

**Start Round**

Start game round in the current room.

<details>

- **Event**

  round:start

- **Params**

  ```typescript
    {
         "roomId": string,
         "roundId": string
    }
  ```

- **Success event name**

  round:start

- **Success event data**

  ```typescript
  {
    "round":  
        roundId: string;
        issueId: string;
        roundInProgress: boolean;
        usersVoteResults: UserVoteResult[];
        statistics: VoteResult | null;
  }
  ```

- **Success callback response**

  ```typescript
  {
    "round": 
        roundId: string;
        issueId: string;
        roundInProgress: boolean;
        usersVoteResults: UserVoteResult[];
        statistics: VoteResult | null;
  }
  ```

- **Error callback:**

  ```typescript
  {
    error: string;
  }
  ```

- **Notes:**

  None

</details>

**Stop Round**

Stop game round in the current room.

<details>

- **Event**

  round:stop

- **Params**

  ```typescript
    {
         "roomId": string,
         "roundId": string
    }
  ```

- **Success event name**

  round:stop

- **Success event data**

  ```typescript
  {
    "round":  
        roundId: string;
        issueId: string;
        roundInProgress: boolean;
        usersVoteResults: UserVoteResult[];
        statistics: VoteResult | null;
  }
  ```

- **Success callback response**

  ```typescript
  {
    "round": 
        roundId: string;
        issueId: string;
        roundInProgress: boolean;
        usersVoteResults: UserVoteResult[];
        statistics: VoteResult | null;
  }
  ```

- **Error callback:**

  ```typescript
  {
    error: string;
  }
  ```

- **Notes:**

  None

</details>

**Restart Round**

Restart game round in the current room.

<details>

- **Event**

  round:restart

- **Params**

  ```typescript
    {
         "roomId": string,
         "roundId": string
    }
  ```

- **Success event name**

  round:restart

- **Success event data**

  ```typescript
  {
    "round":  
        roundId: string;
        issueId: string;
        roundInProgress: boolean;
        usersVoteResults: UserVoteResult[];
        statistics: VoteResult | null;
  }
  ```

- **Success callback response**

  ```typescript
  {
    "round": 
        roundId: string;
        issueId: string;
        roundInProgress: boolean;
        usersVoteResults: UserVoteResult[];
        statistics: VoteResult | null;
  }
  ```

- **Error callback:**

  ```typescript
  {
    error: string;
  }
  ```

- **Notes:**

  None

</details>

**Create User**

Create new user in existing game/room.

<details>

- **Event**

  user:create

- **Params**

  ```typescript
    {
        "newUser": {
                  id: string;
                  image: string | null;
                  firstName: string;
                  lastName: string;
                  position: string;
                  ableToDelete: boolean;
                  score: string;
                  scramMaster: boolean;
                },
         "roomId": string
    }
  ```

- **Success event name**

  notification

- **Success event data**
  ```typescript
  {
    message: `${userName} just joined the game`;
  }
  ```
- **Success callback response**

  ```typescript
  {
    user: {
      id: string;
      image: string | null;
      firstName: string;
      lastName: string;
      position: string;
      ableToDelete: boolean;
      score: string;
      scramMaster: boolean;
    }
  }
  ```

- **Error callback:**

  ```typescript
  {
    error: "This game no longer exists";
  }
  ```

- **Notes:**

  None

</details>

**Delete User**

Delete user from existing game.

<details>

- **Event**

  user:delete

- **Params**

  ```typescript
    {
         userId: string,
         roomId: string
    }
  ```

- **Success event name**

  None

- **Success event data**

  None

- **Success callback response**

  ```typescript
             {
               users: User[]
             }
  ```

- **Error callback:**

  ```typescript
  {
    error: string;
  }
  ```

- **Notes:**

  None

</details>

**Create Issue**

Create new issue in existing game/room.

<details>

- **Event**

  game:issue-add

- **Params**

  ```typescript
    {
        "newIssue": {
                  id: string;
                  issueName: string;
                  priority: string;
                  selected: boolean;
                  link: string;
                  editable: boolean;
                },
         "roomId": string
    }
  ```

- **Success event name**

  None

- **Success event data**

  None

- **Success callback response**

  ```typescript
  {
    issue: {
      id: string;
      issueName: string;
      priority: string;
      selected: boolean;
      link: string;
      editable: boolean;
    }
  }
  ```

- **Error callback:**

  ```typescript
  {
    error: string;
  }
  ```

- **Notes:**

  None

</details>

**Delete Issue**

Delete issue from existing game.

<details>

- **Event**

  game:issue-delete

- **Params**

  ```typescript
    {
         issueId: string,
         roomId: string
    }
  ```

- **Success event name**

  None

- **Success event data**

  None

- **Success callback response**

  ```typescript
             {
               issues: Issue[]
             }
  ```

- **Error callback:**

  ```typescript
  {
    error: string;
  }
  ```

- **Notes:**

  None

</details>

**Update Issue**

Update issue parameters.

<details>

- **Event**

  game:issue-update

- **Params**

  ```typescript
    {
         issueToUpdate: {
              id: string;
              issueName: string;
              priority: string;
              selected: boolean;
              link: string;
              editable: boolean;
                },
         roomId: string
    }
  ```

- **Success event name**

  None

- **Success event data**

  None

- **Success callback response**

  ```typescript
     {
       issues: Issue[]
  ```

- **Error callback response:**

  ```typescript
  {
    error: string;
  }
  ```

- **Notes:**

  None

</details>

**Create Card**

Create new card in existing game/room.

<details>

- **Event**

  game:card-add

- **Params**

  ```typescript
    {
        "newCard": {
              id: string;
              value: string;
              type: string;
              shortType: string;
              selected: boolean;
              editable: boolean;
                },
         "roomId": string
    }
  ```

- **Success event name**

  None

- **Success event data**

  None

- **Success callback response**

  ```typescript
  {
    card: {
      id: string;
      value: string;
      type: string;
      shortType: string;
      selected: boolean;
      editable: boolean;
    }
  }
  ```

- **Error callback:**

  ```typescript
  {
    error: string;
  }
  ```

- **Notes:**

  None

</details>

**Delete Card**

Delete card from existing game.

<details>

- **Event**

  game:card-delete

- **Params**

  ```typescript
    {
         cardId: string,
         roomId: string
    }
  ```

- **Success event name**

  None

- **Success event data**

  None

- **Success callback response**

  ```typescript
             {
               cards: Card[]
             }
  ```

- **Error callback:**

  ```typescript
  {
    error: string;
  }
  ```

- **Notes:**

  None

</details>

**Update Card**

Update card parameters.

<details>

- **Event**

  game:card-update

- **Params**

  ```typescript
    {
         cardToUpdate: string,
         roomId: string
    }
  ```

- **Success event name**

  None

- **Success event data**

  None

- **Success callback response**

  ```typescript
     {
       cards: Card[]
     }
  ```

- **Error callback response:**

  ```typescript
  {
    error: string;
  }
  ```

- **Notes:**

  None

</details>

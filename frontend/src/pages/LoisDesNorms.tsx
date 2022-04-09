import { CircularProgress, Container, Grid, SelectChangeEvent, Typography } from "@mui/material";
import { useEffect, useReducer, useState } from "react";
import { emptyDiscordPlayer, emptyPlayer, MessageActions, Player } from "../helpers/loisDesNorms";
import AdditionalInformationBlock from "../components/LoisDesNorms/AdditionalInformationBlock";
import Lobby from "../components/LoisDesNorms/Lobby";

export type LoisDesNormsProperties = {};

interface LoisDesNormsState {
  players: Player[];
  rollCount: number;
  gameInProgress: boolean;
  availablePlayers: any;
  gameId: number;
  nextRollTimer: number;
  canRoll: boolean;
}

const LoisDesNorms = (props: LoisDesNormsProperties) => {
  const [wsState, setWsState] = useState<{ ws: WebSocket | undefined }>({
    ws: undefined,
  });

  useEffect(() => {
    const ws = new WebSocket(
      process.env.REACT_APP_WEBSOCKET_ENDPOINT || "ws://localhost:3001/"
    );

    ws.onmessage = function (event) {
      const msg = JSON.parse(event.data);
      if (msg.action) {
        dispatch(msg);
      }
    };

    const newState = {
      ws: ws,
    };

    setWsState(newState);
  }, []);

  const [state, dispatch] = useReducer(
    (
      state: LoisDesNormsState,
      message: { action: MessageActions; content: any }
    ) => {
      switch (message.action) {
        case "updatePlayers": {
          const newPlayers = message.content;
          const newState = { ...state, players: newPlayers };
          const players = newPlayers.map((x: Player) => x.player);
          wsState.ws?.send(
            JSON.stringify({
              action: "updatePlayers",
              content: JSON.stringify(players),
            })
          );
          return newState;
        }
        case "updateState": {
          const newState = JSON.parse(message.content);
          newState.availablePlayers[""] = { name: undefined, stat: {} };
          return newState;
        }
      }
      return state;
    },
    {
      players: [
        emptyPlayer(),
        emptyPlayer(),
        emptyPlayer(),
        emptyPlayer(),
        emptyPlayer(),
      ],
      rollCount: 0,
      gameInProgress: false,
      gameId: -1,
      nextRollTimer: 0,
      canRoll: false,
      availablePlayers: [emptyDiscordPlayer()],
    }
  );

  const reset = (_: any) => {
    wsState.ws?.send(JSON.stringify({ action: "reset", content: undefined }));
  };

  const roll = (_: any) => {
    wsState.ws?.send(JSON.stringify({ action: "roll", content: undefined }));
  };

  const cancel = (_: any) => {
    wsState.ws?.send(JSON.stringify({ action: "cancel", content: undefined}));
  };

  const onPlayerChange = (event: SelectChangeEvent<string>, index: number) => {
    const playerChangeId = event.target.value as string;
    const previousPlayer = state.players[index].player;
    if (playerChangeId !== state.players[index].player.id) {
      for (let i = 0; i < state.players.length; i++) {
        if (state.players[i].id === playerChangeId) {
          state.players[i] = previousPlayer;
          break;
        }
      }
      state.players[index] = {
        ...state.players[index],
        player: {
          id: playerChangeId,
          name: state.availablePlayers[playerChangeId],
        },
      };
      dispatch({ action: "updatePlayers", content: state.players });
    }
  };

  if(state.gameId < 0) {
    <Container>
      <Typography variant="h4" component="h4" align="center">Lois Des Norms</Typography>
      <CircularProgress />
    </Container>
  }

  return (
    <Container>
      <Typography variant="h4" component="h4" align="center">Lois Des Norms</Typography>
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2}
        style={{  maxWidth: "100%", minHeight: 440}}
      >
        <Grid item>
          <Lobby
            rollCount={state.rollCount}
            players={state.players}
            availablePlayers={state.availablePlayers}
            canRoll={state.canRoll}
            nextRollTimer={state.nextRollTimer}
            reset={reset}
            roll={roll}
            cancel={cancel}
            onPlayerChange={onPlayerChange}
          />
        </Grid>
        <Grid item>
          <AdditionalInformationBlock
            availablePlayers={state.availablePlayers}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoisDesNorms;

import { Container, Grid, SelectChangeEvent } from "@mui/material";
import { useEffect, useReducer, useState } from "react";
import { MessageActions, Player } from "../helpers/loisDesNorms";
import AdditionalInformationBlock from "../components/LoisDesNorms/AdditionalInformationBlock";
import Lobby from "../components/LoisDesNorms/Lobby";

export type LoisDesNormsProperties = {};

interface LoisDesNormsState {
  players: Player[];
  rollCount: number;
  gameInProgress: boolean;
  availablePlayers: any;
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
        { player: { id: "", name: undefined }, role: undefined },
        { player: { id: "", name: undefined }, role: undefined },
        { player: { id: "", name: undefined }, role: undefined },
        { player: { id: "", name: undefined }, role: undefined },
        { player: { id: "", name: undefined }, role: undefined },
      ],
      rollCount: 0,
      gameInProgress: false,
      availablePlayers: [{ id: undefined, name: undefined }],
    }
  );

  const reset = (_: any) => {
    wsState.ws?.send(JSON.stringify({ action: "reset", content: undefined }));
  };

  const roll = (_: any) => {
    wsState.ws?.send(JSON.stringify({ action: "roll", content: undefined }));
  };

  const onPlayerChange = (event: SelectChangeEvent<string>, index: number) => {
    const playerChangeId = event.target.value as string;
    console.log(event.target.value);
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

  return (
    <Container>
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2}
        style={{ minHeight: "70vh", maxWidth: "100%" }}
      >
        <Grid item style={{ height: 364 }}>
          <Lobby
            rollCount={state.rollCount}
            players={state.players}
            availablePlayers={state.availablePlayers}
            reset={reset}
            roll={roll}
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

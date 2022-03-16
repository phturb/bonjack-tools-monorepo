import {
  Container,
  Button,
  Box,
  Typography,
  Grid,
  Tabs,
  Tab,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  SelectChangeEvent,
} from "@mui/material";
import { useEffect, useReducer, useState } from "react";
import PlayerInfo from "../components/PlayerInfo";
import { LeagueOfLegendsRole } from "../helpers/loisDesNorms";

export type LoisDesNormsProperties = {};

interface DiscordPlayer {
  id: string;
  name: string | undefined;
}

interface Player {
  player: DiscordPlayer;
  role: LeagueOfLegendsRole | undefined;
}

interface LoisDesNormsState {
  players: Player[];
  rollCount: number;
  gameInProgress: boolean;
  availablePlayers: any;
}

const ws = new WebSocket("ws://tools.bonjack.club:3001/");

const LoisDesNorms = (props: LoisDesNormsProperties) => {
  const [tabState, setTabState] = useState<number>(0);

  const [state, dispatch] = useReducer(
    (state: LoisDesNormsState, message: { action: string; content: any }) => {
      switch (message.action) {
        case "updatePlayers": {
          const newPlayers = message.content;
          const newState = { ...state, players: newPlayers };
          const players = newPlayers.map((x: Player) => x.player);
          ws.send(
            JSON.stringify({
              action: "updatePlayers",
              content: JSON.stringify(players),
            })
          );
          return newState;
        }
        case "updateState": {
          const newState = JSON.parse(message.content);
          newState.availablePlayers[""] = undefined;
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
  useEffect(() => {
    ws.onmessage = function (event) {
      const msg = JSON.parse(event.data);
      if (msg.action) {
        dispatch(msg);
      }
    };
  }, [ws]);

  const reset = (_: any) => {
    ws.send(JSON.stringify({ action: "reset", content: undefined }));
  };

  const roll = (_: any) => {
    ws.send(JSON.stringify({ action: "roll", content: undefined }));
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
        <Grid item style={{height: 364}}>
          <Paper>
            <Box>
              <Typography component="h2" variant="h4">
                Roll count : {state.rollCount}
              </Typography>
            </Box>
            <Box component="form" sx={{ width: 320 }}>
              {state.players.map((player: Player, index: number) => {
                return (
                  <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    key={`player-info-${index}`}
                  >
                    <Grid item xs={8}>
                      <FormControl fullWidth>
                        <InputLabel
                          id={`player-${index + 1}-select-label`}
                        >{`Player ${index + 1}`}</InputLabel>
                        <Select
                          labelId={`player-${index + 1}-select-label`}
                          id={`player-${index + 1}-select`}
                          value={player.player.id}
                          label={`Player ${index + 1}`}
                          onChange={(evt) => {
                            onPlayerChange(evt, index);
                          }}
                        >
                          {Object.entries(state.availablePlayers).map(
                            (value) => {
                              return (
                                <MenuItem
                                  key={value[0] + "-select-item"}
                                  value={value[0]}
                                >
                                  {value[1] as string}
                                </MenuItem>
                              );
                            }
                          )}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs="auto">
                      {player.role && (
                        <Chip label={player.role} variant="outlined" />
                      )}
                    </Grid>
                  </Grid>
                );
              })}
            </Box>
            <div>
              <Button variant="outlined" onClick={reset}>
                Reset
              </Button>
              <Button variant="contained" onClick={roll}>
                Roll
              </Button>
            </div>
          </Paper>
        </Grid>
        <Grid item>
          <Paper>
            <Tabs
              value={tabState}
              onChange={(event, value) => {
                setTabState(value);
              }}
            >
              <Tab id="rules" label="Rules" value={0} />
              <Tab id="stats" label="Stats" value={1} />
            </Tabs>
            <div hidden={tabState !== 1} style={{height: 300, width: 400}}>
              <Typography>WIP</Typography>
            </div>
            <div hidden={tabState !== 0} style={{height: 300, width: 400}}>
              <ul>
                <li>1. Invade MENDATORY</li>
                <li>2. We can't swap role or champions</li>
                <li>3. You take the first champion you roll</li>
                <li>
                  4. Support takes support item and jungle takes smite and
                  jungle item
                </li>
                <li>5. You need to play until you win</li>
                <li>
                  6. If a rematch is called and everyone jumps in, the rules
                  starts over again
                </li>
                <li>7. You can't surrender</li>
              </ul>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoisDesNorms;

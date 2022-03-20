import {
  Button,
  Box,
  Typography,
  Paper,
  SelectChangeEvent,
  Stack,
} from "@mui/material";
import { Player } from "../../helpers/loisDesNorms";
import PlayerInfo from "./PlayerInfo";

export interface LobbyProperties {
  rollCount: number;
  players: Player[];
  availablePlayers: any;
  reset: (_: any) => void;
  roll: (_: any) => void;
  onPlayerChange: (event: SelectChangeEvent<string>, index: number) => void;
};

const Lobby = (props: LobbyProperties) => {
  return (
    <Paper style={{ margin: '10' }}>
      <Stack component="form" sx={{
        width: 320, padding: "10px", minHeight: "446px"
      }} spacing={2}>
        <Box>
          <Typography component="h5" variant="h5">
            Roll count : {props.rollCount}
          </Typography>
        </Box>
        {props.players.map((player: Player, index: number) => {
          return (
            <PlayerInfo
              key={`player-info-${index}`}
              index={index}
              availablePlayers={props.availablePlayers}
              playerId={player.player.id}
              role={player.role}
              onChange={props.onPlayerChange}
            />
          );
        })}

        <Stack direction="row" spacing={2} justifyContent="space-around">
          <Button variant="outlined" onClick={props.reset}>
            Reset
          </Button>
          <Button variant="contained" onClick={props.roll}>
            Roll
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default Lobby;

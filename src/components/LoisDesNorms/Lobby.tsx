import {
  Button,
  Box,
  Typography,
  Paper,
  SelectChangeEvent,
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
    <Paper>
      <Box>
        <Typography component="h2" variant="h4">
          Roll count : {props.rollCount}
        </Typography>
      </Box>
      <Box component="form" sx={{ width: 320 }}>
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
      </Box>
      <div>
        <Button variant="outlined" onClick={props.reset}>
          Reset
        </Button>
        <Button variant="contained" onClick={props.roll}>
          Roll
        </Button>
      </div>
    </Paper>
  );
};

export default Lobby;

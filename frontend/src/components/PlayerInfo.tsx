import { LeagueOfLegendsRole } from "../helpers/loisDesNorms";
import { Chip, TextField } from "@mui/material";

export type PlayerInfoProperties = {
  index: number;
  playerName: string;
  role: LeagueOfLegendsRole | undefined;
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
  editable: boolean;
};

const PlayerInfo = (props: PlayerInfoProperties) => {
  const label = `Player ${props.index + 1}`;
  const id = `player-id-${props.index}`;

  return (
    <div>
      <TextField
        id={id}
        label={label}
        variant="outlined"
        value={props.playerName}
        onChange={props.handleChange}
        InputProps={{
          readOnly: !props.editable,
        }}
      />

    </div>
  );
};

export default PlayerInfo;

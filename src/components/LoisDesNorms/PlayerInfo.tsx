import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  SelectChangeEvent,
} from "@mui/material";

export interface PlayerInfoProperties {
  index: number;
  availablePlayers: any;
  playerId: string;
  onChange: (event: SelectChangeEvent<string>, index: number) => void;
  role?: string;
}

const PlayerInfo = (props: PlayerInfoProperties) => {
  const index = props.index;
  const playerId = props.playerId;
  const role = props.role;
  const availablePlayers = props.availablePlayers;
  const onChange = props.onChange;

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
          <InputLabel id={`player-${index + 1}-select-label`}>{`Player ${
            index + 1
          }`}</InputLabel>
          <Select
            labelId={`player-${index + 1}-select-label`}
            id={`player-${index + 1}-select`}
            value={playerId}
            label={`Player ${index + 1}`}
            onChange={(evt) => {
              onChange(evt, index);
            }}
          >
            {Object.entries(availablePlayers).map((value) => {
              return (
                <MenuItem key={value[0] + "-select-item"} value={value[0]}>
                  {value[1] as string}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs="auto">
        {role && <Chip label={role} variant="outlined" />}
      </Grid>
    </Grid>
  );
};

export default PlayerInfo;

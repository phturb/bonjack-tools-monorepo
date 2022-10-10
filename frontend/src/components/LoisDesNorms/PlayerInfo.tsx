import React from 'react';
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  SelectChangeEvent,
  Avatar,
} from "@mui/material";
import topThumb from '../../img/Position_TOP.png';
import adcThumb from '../../img/Position_ADC.png';
import supportThumb from '../../img/Position_SUPPORT.png';
import midThumb from '../../img/Position_MID.png';
import jungleThumb from '../../img/Position_JUNGLE.png';

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

  const imgs = {
    TOP: topThumb,
    ADC: adcThumb,
    SUPPORT: supportThumb,
    MID: midThumb,
    JUNGLE: jungleThumb, 
  }

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
                  {(value[1] as any).name as string}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs="auto">
        {role && <Chip sx={{width:"105px"}} label={role} avatar={<Avatar alt={role} src={(imgs as any)[role]} />} variant="outlined" />}
      </Grid>
    </Grid>
  );
};

export default PlayerInfo;

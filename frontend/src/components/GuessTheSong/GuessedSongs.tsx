import React from 'react';
import { Grid, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { PlayedTracks } from '../../interfaces/GuessTheSong/PlayedTracks';

interface GuessedSongsProps {
  guessedSongs: PlayedTracks[];
}

const GuessedSongs = (props: GuessedSongsProps) => {
  const itemizedGuessedSongs = props.guessedSongs.filter(s => s.guessed).map((guessedSong, i) => {
    return <ListItem key={guessedSong.raw.track.name + i}>
      <ListItemText primary={guessedSong.raw.track.name} />
    </ListItem>;
  });
  const itemizedFailedSongs = props.guessedSongs.filter(s => !s.guessed).map((guessedSong, i) => {
    return <ListItem key={guessedSong.raw.track.name + i}>
      <ListItemText primary={guessedSong.raw.track.name} />
    </ListItem>;
  });
  return <Grid container spacing={2}>
    <Grid item xs={12}>
      <Typography variant="h6" align="center">Song Guess Results</Typography>
    </Grid>
    <Grid item xs={6}>
      <Stack direction="row" spacing={1}>
        <CheckCircleIcon color="success" />
        <Typography variant="subtitle1" align="center">Guessed</Typography>
      </Stack>
      <List>{itemizedGuessedSongs}</List>
    </Grid>
    <Grid item xs={6}>
      <Stack direction="row" spacing={1}>
        <CancelIcon color="error" />
        <Typography variant="subtitle1" align="center">Failed</Typography>
      </Stack>
      <List>{itemizedFailedSongs}</List>
    </Grid>
  </Grid>
};

export default GuessedSongs;

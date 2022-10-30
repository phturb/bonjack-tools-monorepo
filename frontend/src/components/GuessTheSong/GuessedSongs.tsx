import { List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import React from 'react';

interface GuessedSongsProps {
  guessedSongs: any[];
}

const GuessedSongs = (props: GuessedSongsProps) => {
  const itemizedGuessedSongs = props.guessedSongs.map((guessedSong, i) => {
    return <ListItem key={guessedSong + i}>
      <ListItemText primary={guessedSong.raw.track.name} secondary={guessedSong.guessed ? "Guessed" : "Failed"} />
      </ListItem>;
  });
  return <Stack spacing={2}>
    <Typography variant="subtitle1">Previous Song Guess Results</Typography>
    {props.guessedSongs.length <= 0 ? <Typography variant="body2" align="center">Empty</Typography> : <List>{itemizedGuessedSongs}</List>}
  </Stack>
};

export default GuessedSongs;

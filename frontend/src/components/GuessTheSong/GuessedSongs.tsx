import { List, ListItem, ListItemText } from '@mui/material';
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
  return <List>{itemizedGuessedSongs}</List>
};

export default GuessedSongs;

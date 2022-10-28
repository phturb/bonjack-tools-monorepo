import React, { useState } from 'react';
import { Button, Grid, TextField } from '@mui/material';
import SpotifyWebApi from 'spotify-web-api-js';

interface GuessingPlaylistSelectorProps {
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs,
  updatePlaylistId: (value: string) => void,
}

const playlistIdParser = (playlistId: string) => {
  if (playlistId.startsWith("http")) {
    const paramRemoved = playlistId.split("?")[0];
    console.log(paramRemoved);
    const splitUrl = paramRemoved.split("/");
    console.log(splitUrl);
    return splitUrl[splitUrl.length - 1];
  } else {
    return playlistId;
  }
}

const GuessingPlaylistSelector = (props: GuessingPlaylistSelectorProps) => {
  const [localPlaylistId, setLocalPlaylistId] = useState("");
  const [currentErrorMessage, setCurrentErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const onChange = (event: any) => {
    setLocalPlaylistId(event.target.value);
  };

  const onSubmit = () => {
    // verify playlist id
    setCurrentErrorMessage("");
    if (localPlaylistId.length > 0) {
      const playlistId = playlistIdParser(localPlaylistId);
      console.log(playlistId);
      setIsLoading(true);
      props.spotifyApi.getPlaylist(playlistId, {}, (err, result) => {
        setIsLoading(false);
        if (!err) {
          setCurrentErrorMessage("");
          props.updatePlaylistId(playlistId);
        } else {
          setCurrentErrorMessage(err.response);
        }
      });
    } else {
      setIsLoading(false);
      setCurrentErrorMessage("PlaylistId can't be empty !")
    }
  };

  return (<Grid container alignItems="center" justifyContent="center" justifyItems="center" spacing={2}>
    <Grid item xs={8}>
      <TextField fullWidth error={currentErrorMessage.length > 0} helperText={currentErrorMessage} variant="standard" label="PlaylistId" onChange={onChange} />
    </Grid>
    <Grid item xs={2}>
      <Button onClick={onSubmit} >Submit</Button>
    </Grid>
  </Grid>)
};

export default GuessingPlaylistSelector;

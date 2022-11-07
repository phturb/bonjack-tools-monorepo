import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import SpotifyWebApi from 'spotify-web-api-js';
import { Stack } from '@mui/system';

interface GuessingPlaylistSelectorProps {
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs,
  updatePlaylistId: (value: string) => void,
}

const playlistIdParser = (playlistId: string) => {
  if (playlistId.startsWith("http")) {
    const paramRemoved = playlistId.split("?")[0];
    const splitUrl = paramRemoved.split("/");
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
      props.spotifyApi.getPlaylist(playlistId, {}).then((result) => {
        setCurrentErrorMessage("");
        props.updatePlaylistId(playlistId);
      }).catch((err) => {
        setCurrentErrorMessage(err.response);
      }).finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
      setCurrentErrorMessage("PlaylistId can't be empty !")
    }
  };

  return (
  <Stack alignItems="center" spacing={1}>
    <Typography variant="subtitle1" align="center">Enter the playlist id that you want to use</Typography>
    <Stack direction="row" spacing={1}>
      <TextField fullWidth error={currentErrorMessage.length > 0} helperText={currentErrorMessage} variant="standard" label="PlaylistId" onChange={onChange} />
      <Button onClick={onSubmit} >Submit</Button>
    </Stack>
  </Stack>)
};

export default GuessingPlaylistSelector;

import React from "react";
import { Button, Stack, Typography } from "@mui/material";

const SPOTIFY_CLIENT_ID = "8ad1f30ed686473cb11eb34ce677c3fe";

const SPOTIFY_SCOPE =
  "user-read-private user-read-email user-modify-playback-state app-remote-control user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-playback-position streaming";

const generateRandomString = (length: number) => {
  let randomString = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return randomString;
};
const ConnectSpotify = () => {
  const onConnectClick = () => {
    const state = generateRandomString(16);
    const redirectUri = window.location.href;
    localStorage.setItem("spotifyStateKey", state);
    let authUrl = `https://accounts.spotify.com/authorize`;
    authUrl += `?response_type=token`;
    authUrl += `&client_id=${encodeURIComponent(SPOTIFY_CLIENT_ID)}`;
    authUrl += `&scope=${encodeURIComponent(SPOTIFY_SCOPE)}`;
    authUrl += `&redirect_uri=${encodeURIComponent(redirectUri)}`;
    authUrl += `&state=${encodeURIComponent(state)}`;
    window.location.href = authUrl;
  };

  return (
    <Stack>
      <Typography variant="h4" align="center">
        Connect Spotify
      </Typography>
      <Button variant="outlined" onClick={onConnectClick}>
        Connect
      </Button>
    </Stack>
  );
};

export default ConnectSpotify;

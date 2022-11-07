import React, { useEffect, useState } from "react";
import ConnectSpotify from "../components/GuessTheSong/ConnectSpotify";
import GuessingComponent from "../components/GuessTheSong/GuessingComponent";
import SpotifyWebApi from "spotify-web-api-js";
import { useLocation } from "react-router-dom";
import GuessingPlaylistSelector from "../components/GuessTheSong/GuessingPlaylistSelector";
import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

const GuessTheSong = () => {
  const [spotifyApi, setSpotifyApi] = useState(new SpotifyWebApi());
  const [token, setAccessToken] = useState("");
  const { hash } = useLocation();
  const [playlistId, setPlaylistId] = useState("");

  useEffect(() => {
    if (hash) {
      const hashParams = hash.split("&");
      for (const paramGroup of hashParams) {
        if (paramGroup.startsWith("#access_token=")) {
          const newToken = paramGroup.replace("#access_token=", "");
          spotifyApi.setAccessToken(newToken);
          setAccessToken(newToken);
          setSpotifyApi(spotifyApi);
        }
      }
    }
  }, [hash]);

  const guessingComponentSelector = () => {
    return (
      <>
        {playlistId ? (
          <Stack>
            <GuessingComponent
              spotifyApi={spotifyApi}
              playlistId={playlistId}
              updatePlaylistId={setPlaylistId}
            />
          </Stack>
        ) : (
          <GuessingPlaylistSelector
            spotifyApi={spotifyApi}
            updatePlaylistId={setPlaylistId}
          />
        )}
      </>
    );
  };

  return (
    <Container>
      <Typography variant="h4" component="h4" align="center">
        Guess the Song
      </Typography>
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Paper sx={{ width: 320, padding: 2 }}>
          {!spotifyApi.getAccessToken() ? (
            <ConnectSpotify />
          ) : (
            guessingComponentSelector()
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default GuessTheSong;

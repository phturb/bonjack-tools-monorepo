import React, { useEffect, useState } from 'react';
import { Autocomplete, Avatar, Box, Button, Grid, Skeleton, Slider, Stack, TextField, Typography } from '@mui/material';
import SpotifyWebApi from 'spotify-web-api-js';
import GuessedSongs from './GuessedSongs';
import { green, red } from '@mui/material/colors';

interface GuessingComponentProps {
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs,
  playlistId: string,
  updatePlaylistId: (playlistId: string) => void
}

const GUESS_STAGES = [1, 2, 5, 7, 11, 16, -1];

const INTERVAL_TIME = 250; // 250ms

const GuessingComponent = (props: GuessingComponentProps) => {
  const [currentGuessStage, setCurrentGuessStage] = useState(0);
  const [currentSong, setCurrentSong] = useState<string | undefined>(undefined);
  const [songWasGuessed, setSongWasGuessed] = useState(false);
  const [currentGuessInput, setCurrentGuessInput] = useState("");
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<SpotifyApi.PlaylistTrackObject[]>([]);
  const [playedTracks, setPlayedTracks] = useState<{ raw: SpotifyApi.PlaylistTrackObject, guessed: boolean }[]>([]);
  const [notPlayedTracks, setNotPlayedTracks] = useState<SpotifyApi.PlaylistTrackObject[]>([]);
  const [currentlyPlayingTrack, setCurrentlyPlayingTrack] = useState<SpotifyApi.PlaylistTrackObject | undefined>(undefined);
  const [currentPlaylist, setCurrentPlaylist] = useState<any>(undefined);
  const [errorList, setErrorList] = useState<Error[]>([]);
  const [currentSongTime, setCurrentSongTime] = useState<number>(0);
  const [guessError, setGuessError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const selectRandomTrack = (tracks: SpotifyApi.PlaylistTrackObject[]): [SpotifyApi.PlaylistTrackObject | undefined, number] => {
    if (tracks.length <= 0) {
      return [undefined, -1];
    }
    const index = Math.floor(Math.random() * (tracks.length - 1));
    return [tracks[index], index];
  };

  const populatePlaylist = async (playlistId: string) => {
    let offset = 0;
    let tracks: SpotifyApi.PlaylistTrackObject[] = [];
    try {
      let result = await props.spotifyApi.getPlaylistTracks(playlistId, { offset: offset });
      offset += result.limit;
      while(offset < result.total) {
        result = await props.spotifyApi.getPlaylistTracks(playlistId, { offset: offset });
        tracks = tracks.concat(result.items);
        offset += result.limit;
      }
    } finally {
      let playlistTracksCopy: SpotifyApi.PlaylistTrackObject[]  = [];
      tracks.forEach((t) => { playlistTracksCopy.push(t)});
      setPlaylistTracks(playlistTracksCopy);
      setPlayedTracks([]);
      const [nextTrack, nextTrackIndex] = selectRandomTrack(tracks); 
      setCurrentlyPlayingTrack(nextTrack);
      playlistTracksCopy = [];
      tracks.forEach((t) => { playlistTracksCopy.push(t)});
      playlistTracksCopy.splice(nextTrackIndex);
      setNotPlayedTracks(playlistTracksCopy);
    }
  }

  useEffect(() => {
    setPlayedTracks([]);
    populatePlaylist(props.playlistId);
    props.spotifyApi.getPlaylist(props.playlistId, {}).then((result) => {
      setCurrentPlaylist(result);
      return populatePlaylist(props.playlistId);
    }).catch((err) => { console.error(err) }).finally(() => { setIsLoading(false) });
  }, [props.playlistId, props.spotifyApi]);

  const onTrackStart = (guessStage: number) => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    props.spotifyApi.setShuffle(false, {}, (err) => {
      if (err) {
        console.error(err);
      }
    });
    if (!songWasGuessed && GUESS_STAGES[guessStage] >= 0) {
      const newIntervalId = setInterval(() => {
        props.spotifyApi.getMyCurrentPlaybackState({}, (err, result) => {
          setCurrentSongTime(result?.progress_ms ?? 0);
          if (err || !result.is_playing || !result?.progress_ms || result.progress_ms > GUESS_STAGES[guessStage] * 1000) {
            props.spotifyApi.pause({}).then(() => {
              return props.spotifyApi.seek(0, {});
            }).then(() => {
              setCurrentSongTime(0);
              return props.spotifyApi.getMyCurrentPlaybackState({});
            }).then((result) => {
              setCurrentSongTime(result?.progress_ms ?? 0);
            }).catch((err) => { console.error(err); });
            if (intervalId) {
              clearInterval(intervalId);
            }
            clearInterval(newIntervalId);
            setIntervalId(null);
          }
        });
      }, INTERVAL_TIME);
      setIntervalId(newIntervalId);
    }
    props.spotifyApi.getMyCurrentPlayingTrack({}).then((result) => {
      setCurrentSong(result.item?.name);
    }).catch((err) => { console.error(err); });
  };

  const onNextClick = () => {
    const newGuessStage = currentGuessStage + 1;
    if (newGuessStage >= GUESS_STAGES.length) {
      setCurrentGuessStage(GUESS_STAGES.length - 1);
    } else {
      setCurrentGuessStage(newGuessStage);
    }
    if (!currentlyPlayingTrack) {
      console.error("NO PLAYING TRACK");
      return;
    }
    props.spotifyApi.seek(0, {}).then(() => {
      return props.spotifyApi.play({ uris: [currentlyPlayingTrack?.track.uri] });
    }).then(() => {
        onTrackStart(newGuessStage);
    }).catch((err) => { console.error(err); });
  };

  const goToNextTrack = () => {
    setCurrentGuessStage(0);
    setSongWasGuessed(false);
    setCurrentSong(undefined);
    setCurrentGuessInput("");
    setGuessError("");
    const [nextTrack, nextTrackIndex] = selectRandomTrack(notPlayedTracks);
    if (!nextTrack) {
      console.error("NO NEXT TRACK");
      return;
    }
    props.spotifyApi.play({ uris: [nextTrack?.track.uri] }).then(() => {
      props.spotifyApi.pause().catch((err) => { console.error(err); });

      setCurrentlyPlayingTrack(nextTrack);
      notPlayedTracks.splice(nextTrackIndex);
      setNotPlayedTracks(notPlayedTracks);
    }).catch((err) => { console.error(err); });
  }

  const onSkipClick = () => {
    if (currentlyPlayingTrack && playedTracks.filter((value) => value.raw.track.name === currentlyPlayingTrack.track.name).length <= 0) {
      playedTracks.push({ raw: currentlyPlayingTrack, guessed: false });
      setPlayedTracks(playedTracks);
    }
    goToNextTrack();
  };

  const onPlayClick = () => {
    if (!currentlyPlayingTrack) {
      console.error("NO PLAYING TRACK");
      return;
    }
    props.spotifyApi.seek(0, {}).then(() => {
      return props.spotifyApi.play({ uris: [currentlyPlayingTrack?.track.uri] });
    }).then(() => {
        onTrackStart(currentGuessStage);
    }).catch((err) => { console.error(err); });
  };

  const onGuessInputSubmitClick = () => {
    const guessResult = currentGuessInput === currentSong;
    setSongWasGuessed(songWasGuessed || guessResult);
    if (guessResult) {
      setGuessError("");
      if (currentlyPlayingTrack && playedTracks.filter((value) => value.raw.track.name === currentlyPlayingTrack.track.name).length <= 0) {
        playedTracks.push({ raw: currentlyPlayingTrack, guessed: true });
        setPlayedTracks(playedTracks);
      }
    } else {
      setGuessError("Wrong guess");
      // Try Again logic
    }
  }

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearTimeout(intervalId);
      }
    };
  }, []);

  const loadedComponent = () => (<Stack spacing={2} alignItems="center" justifyContent="center">
    <Typography variant="h5">{currentPlaylist ? currentPlaylist.name : "No Playlist"}</Typography>
    <Stack direction="row" spacing={4} alignItems="center" justifyContent="center">
      {GUESS_STAGES.map((stage, i) => {
        let param;
        if (i === currentGuessStage) {
          param = { sx :{ bgcolor: green[500] }};
        } else if (i < currentGuessStage) {
          param = { sx:{ bgcolor: red[500] }};
        } else {
          param = {};
        }
        if (i >= currentGuessStage - 1 && i <= currentGuessStage + 1) {
          if (stage < 0) {
            return <Avatar key={stage} {...param}>∞</Avatar>;
          } else {
            return <Avatar key={stage} {...param}>{stage}s</Avatar>;
          }
        } else {
          return <></>;
        }
      })}
    </Stack>
    <Button onClick={onPlayClick} disabled={currentSongTime > 0}>Play</Button>
    <Slider
      sx={{width:250}} 
      aria-label="song-progress-indicator"
      size="small"
      value={currentSongTime / 1000}
      min={0}
      max={GUESS_STAGES[currentGuessStage]}
      disabled/>
    {songWasGuessed || currentGuessStage >= (GUESS_STAGES.length - 1)
      ?
      <Button onClick={onSkipClick}>Skip</Button>
      :
      <>
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
          <Autocomplete
            fullWidth
            sx={{width: 230}}
            value={currentGuessInput}
            onChange={(event: any, newValue: string | null) => {
              setCurrentGuessInput(newValue ?? "");
            }}
            onInputChange={(event: any, newValue: string | null) => {
              setCurrentGuessInput(newValue ?? "");
            }}
            freeSolo options={playlistTracks.map((entry) => entry.track.name)} renderInput={(params) => <TextField {...params}
              disabled={songWasGuessed}
              helperText={guessError}
              error={guessError.length > 0}
              label="Guess" />}
          />
          <Button variant="outlined" onClick={onGuessInputSubmitClick}>Guess</Button>
        </Stack>
        <Button onClick={onNextClick}>Next</Button>
      </>}
    <GuessedSongs guessedSongs={playedTracks} />
    <Button onClick={() => { props.updatePlaylistId(""); }}>Reset Playlist</Button>
  </Stack>);

  return isLoading ? <Box sx={{width: "100%"}}>
      <Skeleton variant="text" width={"100%"} sx={{ fontSize: '1rem'}} animation="wave" />
      <Skeleton variant="circular" width={40} height={40} animation="wave" />
      <Skeleton variant="rectangular" width={"100%"} height={200} animation="wave" />
    </Box>
    : loadedComponent();
};

export default GuessingComponent;

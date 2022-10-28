import React, { useEffect, useState } from 'react';
import { Autocomplete, Avatar, Box, Button, Grid, Slider, Stack, TextField, Typography } from '@mui/material';
import SpotifyWebApi from 'spotify-web-api-js';
import GuessedSongs from './GuessedSongs';
import { green, red } from '@mui/material/colors';

interface GuessingComponentProps {
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs,
  playlistId: string,
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

  const selectRandomTrack = (tracks: SpotifyApi.PlaylistTrackObject[]): [SpotifyApi.PlaylistTrackObject | undefined, number] => {
    if (tracks.length <= 0) {
      return [undefined, -1];
    }
    const index = Math.floor(Math.random() * (tracks.length - 1));
    return [tracks[index], index];
  };

  useEffect(() => {
    setPlayedTracks([]);
    const callbackPlaylist = (tracks: SpotifyApi.PlaylistTrackObject[], callOffset: number) => {
      props.spotifyApi.getPlaylistTracks(props.playlistId, { offset: callOffset }, (err, result) => {
        if (err) {
          console.error(err);
          return;
        }
        const offset = result.offset + result.limit;
        tracks = tracks.concat(result.items);
        const playlistTracksCopy: SpotifyApi.PlaylistTrackObject[] = [];
        tracks.forEach(t => playlistTracksCopy.push(t));
        setPlaylistTracks(playlistTracksCopy);
        setNotPlayedTracks(tracks);
        if (offset < result.total) {
          callbackPlaylist(tracks, offset);
        } else {
          const [trackToPlay, trackIndex] = selectRandomTrack(tracks);
          if (trackToPlay && trackIndex >= 0) {
            setCurrentlyPlayingTrack(trackToPlay);
            tracks.splice(trackIndex, 1);
            setNotPlayedTracks(tracks);
          }
        }
      });
    };
    props.spotifyApi.getPlaylist(props.playlistId, {}, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }
      const tracks: SpotifyApi.PlaylistTrackObject[] = [];
      callbackPlaylist(tracks, 0);
      setCurrentPlaylist(result);
    });
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
            props.spotifyApi.pause({}, (err) => {
              if (err) {
                return;
              }
              props.spotifyApi.seek(0, {}, (err) => {
                if (err) {
                  return;
                }
                props.spotifyApi.getMyCurrentPlaybackState({}, (err, result) => {
                  if (err) {
                    return;
                  }
                  setCurrentSongTime(result?.progress_ms ?? 0);
                })
              });
            });
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
    props.spotifyApi.getMyCurrentPlayingTrack({}, (err, result) => {
      if (!err) {
        setCurrentSong(result.item?.name);
      }
    });
  };

  const onNextClick = () => {
    const newGuessStage = currentGuessStage + 1;
    if (newGuessStage >= GUESS_STAGES.length) {
      setCurrentGuessStage(GUESS_STAGES.length - 1);
    } else {
      setCurrentGuessStage(newGuessStage);
    }
    props.spotifyApi.seek(0, {}, (err) => {
      if (!currentlyPlayingTrack) {
        console.error("NO PLAYING TRACK");
        return;
      }
      props.spotifyApi.play({ uris: [currentlyPlayingTrack?.track.uri] }, (err) => {
        if (!err) {
          onTrackStart(newGuessStage);
        }
      });
    });
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
    props.spotifyApi.play({ uris: [nextTrack?.track.uri] }, (err) => {
      props.spotifyApi.pause();

      setCurrentlyPlayingTrack(nextTrack);
      notPlayedTracks.splice(nextTrackIndex);
      setNotPlayedTracks(notPlayedTracks);
    });
  }

  const onSkipClick = () => {
    if (currentlyPlayingTrack && playedTracks.filter((value) => value.raw.track.name === currentlyPlayingTrack.track.name).length <= 0) {
      playedTracks.push({ raw: currentlyPlayingTrack, guessed: false });
      setPlayedTracks(playedTracks);
    }
    goToNextTrack();
  };

  const onPlayClick = () => {
    props.spotifyApi.seek(0, {}, (err) => {
      if (!currentlyPlayingTrack) {
        console.error("NO PLAYING TRACK");
        return;
      }
      props.spotifyApi.play({ uris: [currentlyPlayingTrack?.track.uri] }, (err) => {
        if (!err) {
          onTrackStart(currentGuessStage);
        }
      });
    });
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

  return (<Stack spacing={2} alignItems="center" justifyContent="center">
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
        if (stage < 0) {
          return <Avatar key={stage} {...param}>∞</Avatar>;
        } else {
          return <Avatar key={stage} {...param}>{stage}s</Avatar>;
        }
      })}
    </Stack>
    <Button onClick={onPlayClick} disabled={currentSongTime > 0}>Play</Button>
    <Box width={350}>
    <Slider aria-label="song-progress-indicator" size="small" value={currentSongTime / 1000} min={0} max={GUESS_STAGES[currentGuessStage]} disabled={GUESS_STAGES[currentGuessStage] >= 0} />
    </Box>
    {songWasGuessed || currentGuessStage >= (GUESS_STAGES.length - 1)
      ?
      <Button onClick={onSkipClick}>Skip</Button>
      :
      <>
        <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
          <Grid item xs={6}>
            <Autocomplete
              fullWidth
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
          </Grid>
          <Grid item xs={2}>
            <Button onClick={onGuessInputSubmitClick}>Submit guess</Button>
          </Grid>
        </Grid>
        <Button onClick={onNextClick}>Next</Button>
      </>}
    <GuessedSongs guessedSongs={playedTracks} />
  </Stack>);
};

export default GuessingComponent;

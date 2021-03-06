require('dotenv').config();
const express = require("express");
const cors = require("cors");
const lyricsFinder = require("lyrics-finder");
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.post("/refresh", (req, res) => {
  const refreshToken = req.body.refreshToken //maybe change needed;
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken,
  });

  spotifyApi
    .refreshAccessToken()
    .then((data) => {
      res.json({
          accessToken: data.accessToken, // maybe to correct
          expiresIn: data.expiresIn // maybe to correct 
      })
    })
    .catch(() => {
      res.sendStatus(400);
    });
});

app.post("/login", (req, res) => {
  const code = req.body.code;
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  });

  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      res.json({
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in,
      });
    })
    .catch((error) => {
      res.sendStatus(400);
    });
});

app.get('/lyrics', async (req, res) => {
  const lyrics = 
  (
    await lyricsFinder(req.query.artist, req.query.track)
  ) || "No Lyrics Found";
  res.json({lyrics})
})

app.listen(3001);

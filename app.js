const express = require("express");
const path = require("path");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'build')));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/build/index.html"));
});


const NEW_SONG_EVENT = "newSongEvent";
const UPDATE_PLAYLIST_EVENT = "updatePlaylistEvent";
const HISTORY_PLAYLIST_EVENT = "historyPlaylistEvent";
const LOGIN_EVENT = "login";
const GET_HISTORY_EVENT = "getHistoryEvent";

let history = [];
io.on("connection", (socket) => {
    socket.on(LOGIN_EVENT, () => {
        console.log(`Client ${socket.id} connected`);
        socket.join();
        io.emit('ready', history);

    })
    // Listen for new song event
    socket.on(NEW_SONG_EVENT, (song) => {
        history.push(song);
        io.emit(NEW_SONG_EVENT, song);
    });
    // get initial data
    socket.on(GET_HISTORY_EVENT, () => {
        io.emit(HISTORY_PLAYLIST_EVENT, history);
    });

    // Listen for update playlist event
    socket.on(UPDATE_PLAYLIST_EVENT, (song) => {
        history = history.filter(item => item.id !== song.id);
        io.emit(UPDATE_PLAYLIST_EVENT, history);
    });
    //  closes the socket
    socket.on("disconnect", () => {
        console.log(`Client ${socket.id} diconnected`);
        socket.leave();
    });
});
http.listen(port, () => console.log(`API listening on ${port}`));

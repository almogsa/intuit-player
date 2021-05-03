//////////////////////////////////////// SEVER IMPLEMENTATION ///////////////////////////////////////////////////

// In my implementation All the data on the server is essentially volatile, if you were to restart the application, all data would be lost.
// Additionally it would not scale across multiple server instances.
// A little more complex solution: Store all playlist in a database and query the database to retrieve the last playlist when a user connects.
// Pros: All data is persistent and if the server were to crash/be stopped, you still would be able to retrieve the data.
// Last solution can be implemented by Redis which is in-memory data structure store
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const server = require("http").createServer();
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
    },
});

const PORT = 4000;
const NEW_SONG_EVENT = "newSongEvent";
const UPDATE_PLAYLIST_EVENT = "updatePlaylistEvent";
const HISTORY_PLAYLIST_EVENT = "historyPlaylistEvent";
const GET_HISTORY_EVENT = "getHistoryEvent";
const LOGIN_EVENT = "login";

let history = [];
io.on("connection", (socket) => {

    socket.on(LOGIN_EVENT,() => {
        console.log(`Client ${socket.id} connected`);
        socket.join();
        io.emit('ready',history);
    })
    // Listen for new song event
    socket.on(NEW_SONG_EVENT, (song) => {
        history.push(song);
        io.emit(NEW_SONG_EVENT, song);
    });
    // get initial data
    socket.on(GET_HISTORY_EVENT, () => {
        io.emit(HISTORY_PLAYLIST_EVENT,history);
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

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

const express = require("express");
const app = express();

let broadcaster;
const port = 4000;

const https = require("https");
const fs = require('fs');
const homedir = require('os').homedir();
const options = {
  key: fs.readFileSync(path.join(homedir, '.ssh', 'canary-webrtc-key.pem')),
  cert: fs.readFileSync(path.join(homedir, '.ssh', 'canary-webrtc-cert.pem')),
};

const server = https.createServer(options, app);

const io = require("socket.io")(server);
app.use(express.static(__dirname + "/public"));

io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {
  socket.on("broadcaster", () => {
    broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });
  socket.on("watcher", () => {
    socket.to(broadcaster).emit("watcher", socket.id);
  });
  socket.on("offer", (id, message) => {
    socket.to(id).emit("offer", socket.id, message);
  });
  socket.on("answer", (id, message) => {
    socket.to(id).emit("answer", socket.id, message);
  });
  socket.on("candidate", (id, message) => {
    socket.to(id).emit("candidate", socket.id, message);
  });
  socket.on("disconnect", () => {
    socket.to(broadcaster).emit("disconnectPeer", socket.id);
  });
});
server.listen(port, () => console.log(`Server is running on port ${port}`));

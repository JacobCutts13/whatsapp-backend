import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

// read in contents of any environment variables in the .env file
dotenv.config();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:
      "https://whatsapp-jacob.netlify.app/*, https://whatsapp-jacob.herokuapp.com/",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");
  const id = socket.handshake.query.id;
  if (id) {
    socket.join(id); //static id
  }

  socket.on(
    "send message",
    (message: { recipients: string[]; text: string }) => {
      console.log(message.text, message.recipients);
      message.recipients.forEach((recipient) => {
        const newRecipients = message.recipients.filter((r) => r !== recipient);
        if (typeof id === "string") newRecipients.push(id);
        socket.broadcast.to(recipient).emit("recieve message", {
          recipients: newRecipients,
          sender: id,
          text: message.text,
        });
      });
    }
  );
});

server.listen(5000, () => {
  console.log("listening on port 5000");
});

// // use the environment variable PORT, or 4000 as a fallback
// const PORT_NUMBER = process.env.PORT ?? 4000;

// // API info page
// app.get("/", (req, res) => {
//   res.sendFile(__dirname + "../public/index.html");
// });

// app.listen(PORT_NUMBER, () => {
//   console.log(`Server is listening on port ${PORT_NUMBER}!`);
// });

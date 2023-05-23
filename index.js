// inside index.js
require("dotenv").config();

const { PORT = 3000 } = process.env
const express = require("express");
const server = express();

const morgan = require("morgan");
server.use(morgan("dev"));

server.use(express.json())

server.get("/background/:color", (req, res, next) => {
	res.send(`
	  <body style="background: ${req.params.color};">
		<h1>Hello World</h1>
	  </body>
	`);
});

server.use((req, res, next) => {
    console.log("<____Body Logger START____>");
    console.log(req.body);
    console.log("<_____Body Logger END_____>");
  
    next();
  });

  const apiRouter = require('./api');
  server.use('/api', apiRouter);

const { client } = require('./db');
client.connect();

server.listen(PORT, () => {
  // old stuff
  console.log('The server is up on port', PORT)
});




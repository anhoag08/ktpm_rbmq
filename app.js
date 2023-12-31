const express = require("express");
const bodyParser = require("body-parser");
const { connect } = require("amqplib");
const WebSocket = require("ws");
const { resizeAndUpload } = require("./resize-upload");

const app = express();
const port = 3000;
const topicExchange = "topicExchange";

app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Handle WebSocket connections
const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (ws) => {
  console.log("create WebSocket Connection")
  ws.on("message", (message) => {
    // Handle WebSocket messages from the web clients
    
    var data = JSON.parse(message);
    const selectedRes = data.selectedResolutions;
    const imgURL = data.imageUrl;
    console.log('receive data from client: ' + selectedRes + '-' + imgURL);

    for (const resolution of selectedRes) {
      const routingKey = `resolution.${resolution}`;
      sendTopicMessage(topicExchange, routingKey, `${imgURL}`);
    }
  });
});

// Create an HTTP server
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

async function sendTopicMessage(exchange, routingKey, message) {
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();

  // Declare a topic exchange
  await channel.assertExchange(exchange, "topic", { durable: true });

  // Publish the message with a specific routing key (resolution)
  channel.publish(exchange, routingKey, Buffer.from(message));

  await channel.close();
  await connection.close();
}

async function createTopicSubscriber(exchange, bindingKey) {
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();

  // Declare a topic exchange
  await channel.assertExchange(exchange, "topic", { durable: true });

  // Declare a queue with a specific name for the binding key (resolution)
  await channel.assertQueue(bindingKey, { exclusive: true });

  // Bind the queue to the exchange with the specified binding key
  await channel.bindQueue(bindingKey, exchange, bindingKey);

  console.log(`Waiting for topic messages with binding key "${bindingKey}"`);

  // Consume messages
  channel.consume(
    bindingKey,
    async (msg) => {
      try {
        console.log('consume message');
        const urlRes = await resizeAndUpload(
          bindingKey.split(".")[1],
          msg.content.toString()
        );
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            console.log('send data to client ' + urlRes + '-' + bindingKey);
            client.send(JSON.stringify({ urlRes, bindingKey }));
          }
        });
      } catch (error) {
        console.error(error);
      }
    },
    { noAck: true }
  ); // noAck: true means the messages are auto-acknowledged

  return channel;
}

const resolutions = ["2560x1440", "1920x1080", "1600x900", "1280x720"];

for (const resolution of resolutions) {
  const bindingKey = `resolution.${resolution}`;
  createTopicSubscriber(topicExchange, bindingKey)
    .then((channel) => {
      // You can add additional code here if needed
    })
    .catch((error) => {
      console.error(`Consumer error for binding key "${bindingKey}":`, error);
    });
}

const { ApolloServer, gql, PubSub } = require("apollo-server-express");
const express = require("express");
const mongoose = require("mongoose");
const typeDefs = require("./typeDefs");
const cors = require("cors");
const Sleep = require("./models/Sleep");
console.log(Sleep);
const path = require("path");

const http = require("http");
const GraphQLDateTime = require("graphql-type-datetime");

const pubsub = new PubSub();
let currentNumber = 0;
function incrementNumber() {
  currentNumber++;
  pubsub.publish("NUMBER_INCREMENTED", { numberIncremented: currentNumber });
  setTimeout(incrementNumber, 1000);
}

resolvers = {
  Subscription: {
    sleepChanged: {
      subscribe: () => pubsub.asyncIterator(["SLEEP_CHANGED"]),
    },
    numberIncremented: {
      subscribe: () => pubsub.asyncIterator(["NUMBER_INCREMENTED"]),
    },
  },
  Query: {
    currentNumber() {
      return currentNumber;
    },
    hello: () => "hi",
    sleeps: () => Sleep.find(),
  },
  Mutation: {
    createSleep: async (_, { time, type }) => {
      pubsub.publish("SLEEP_CHANGED", { sleepChanged: { time, type } });
      const sleep = new Sleep({ time, type });
      await sleep.save();
      return sleep;
    },
  },
};

const startServer = async () => {
  const app = express();
  app.use(cors());
  // app.use(express.static(__dirname + "/ui/build/"));

  app.all("/", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.get("/", (req, res) => {
    res.send("running");
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    subscriptions: {
      onConnect: (connectionParams, webSocket, context) => {
        console.log("Client connected");
      },
      onDisconnect: (webSocket, context) => {
        console.log("Client disconnected");
      },
    },
  });

  incrementNumber();
  server.applyMiddleware({ app });
  const port = process.env.PORT ? process.env.PORT : 4000;
  const httpServer = http.createServer(app);
  server.installSubscriptionHandlers(httpServer);
  await mongoose.connect(
    "mongodb+srv://pedro:pegaju11@babytrack1.evom3.mongodb.net/baby_track?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
    }
  );

  httpServer.listen({ port: port }, () => {
    console.log(`🚀 Server ready at http://localhost:${port}`);
    console.log(
      `🚀 Subscription endpoint ready at ws://localhost:${port}${server.subscriptionsPath}`
    );
  });
};

startServer();

// const { ApolloServer, PubSub, gql } = require('apollo-server');
// const pubsub = new PubSub();
// const PORT = 4000;

// // Schema definition
// // const typeDefs = gql`
// //   type Query {
// //     currentNumber: Int
// //   }

// //   type Subscription {
// //     numberIncremented: Int
// //   }
// // `;

// export const resolvers = {
//   Subscription: {
//     numberIncremented: {
//       subscribe: () => pubsub.asyncIterator(["NUMBER_INCREMENTED"]),
//     },
//   },
//   Query: {
//     currentNumber() {
//       return currentNumber;
//     },
//     hello: () => "hi",
//     sleeps: () => Sleep.find(),
//   },
//   Mutation: {
//     createSleep: async (_, { time, type }) => {
//       const sleep = new Sleep({ time, type });
//       await sleep.save();
//       return sleep;
//     },
//   },
// };

// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
//   subscriptions: {
//     onConnect: (connectionParams, webSocket, context) => {
//       console.log('Client connected');
//     },
//     onDisconnect: (webSocket, context) => {
//       console.log('Client disconnected')
//     },
//   },
// });

// let currentNumber = 0;
// function incrementNumber() {
//   currentNumber++;
//   pubsub.publish('NUMBER_INCREMENTED', { numberIncremented: currentNumber });
//   setTimeout(incrementNumber, 1000);
// }

// server.listen().then(({ url }) => {
//   console.log(`🚀 Subscription endpoint ready at ws://localhost:${PORT}${server.subscriptionsPath}`)
//   console.log('Query at studio.apollographql.com/dev')
// });

// // Start incrementing
// incrementNumber();

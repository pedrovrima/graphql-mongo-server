import { Sleep } from "./models/Sleep";

import GraphQLDateTime from "graphql-type-datetime";

export const resolvers = {
  Query: {
    hello: () => "hi",
    sleeps: () => Sleep.find(),
  },
  Mutation: {
    createSleep: async (_, { time, type }) => {
      const sleep = new Sleep({ time, type });
      await sleep.save();
      return sleep;
    },
  },
};

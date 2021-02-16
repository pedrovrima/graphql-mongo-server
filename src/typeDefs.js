const { gql } = require("apollo-server-express")

module.exports=typeDefs = gql`
  type Query {
    hello: String!
    sleeps(last:Int): [Sleep!]!
    currentNumber: Int

  }

  type Subscription {
    numberIncremented: Int
    sleepChanged: Sleep!
  }

  scalar DateTime 

  type Sleep {
    id: ID!
    time:   DateTime!
    type:  String!
  }

  type Mutation {
    createSleep(time:   DateTime!, type:  String!): Sleep!
  }
`;

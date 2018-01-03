import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { BASE_GRAPHQL_URL } from "../lib/withBaseURL";
import { InMemoryCache } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";

const cache = new InMemoryCache({
  dataIdFromObject: object => {
    switch (object.__typename) {
      case "BioBudord":
        return object.number;
      default:
        return object.id || object._id;
    }
  }
});

persistCache({
  cache,
  storage: window.localStorage
});

const client = new ApolloClient({
  // By default, this client will send queries to the
  //  `/graphql` endpoint on the same host
  // Pass the configuration option { uri: YOUR_GRAPHQL_API_URL } to the `HttpLink` to connect
  // to a different host
  link: new HttpLink({
    uri: BASE_GRAPHQL_URL,
    fetchOptions: { credentials: "include" }
  }),
  cache
});

export default client;

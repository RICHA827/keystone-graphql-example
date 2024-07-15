import { config } from "@keystone-6/core";
import { lists } from "./schema";
import { extendGraphqlSchema } from "./custom-schema";
export default config({
  db: {
    provider: "sqlite",
    url: "file:./keystone.db",
  },
  graphql: {
    extendGraphqlSchema,
  },
  lists,
});

import { RouteShorthandOptionsWithHandler } from "fastify";

export const postOrderV3Options: RouteShorthandOptionsWithHandler = {
  handler: async () => {
    console.log("postOrderV3Options");
    return "postOrderV3Options";
  }
}

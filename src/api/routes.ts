import * as ordersEndpoints from "@/api/endpoints/orders";
import { FastifyInstance } from "fastify";

export const routes = async (server: FastifyInstance) => {
  server.get("/", () => { return `Http and Graphql Server ${new Date()}` });

  server.post("/order/v3", ordersEndpoints.postOrderV3Options);
}

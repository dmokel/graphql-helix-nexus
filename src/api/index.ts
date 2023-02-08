import { routes } from "@/api/routes";
import { schema } from "@/api/schema";
import Hapi from '@hapi/hapi';
import Fastify from "fastify";
import { getGraphQLParameters, processRequest, renderGraphiQL, Request, sendResult, shouldRenderGraphiQL } from "graphql-helix";
import qs from "qs";

// TODO
// hapi会在【await sendResult(result, req.raw.res)】发生err: Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
// 先不用hapi，等待后续官方反馈
export const startHapi = async () => {
  const server = Hapi.server({
    port: 8777,
    query: {
      parser: (query) => qs.parse(query),
    },
    routes: {
      cors: {
        origin: ["*"]
      }
    }
  });

  server.route({
    method: "GET",
    path: "/",
    handler: () => { return `Http and Graphql Server ${new Date()}`; }
  })

  server.route({
    method: ["POST", "GET"],
    path: "/graphql",
    handler: async (req, h) => {
      const request: Request = {
        headers: req.headers,
        method: req.method,
        query: req.query,
        body: req.payload,
      };

      // if (shouldRenderGraphiQL(request)) {
      //   return h.response((
      //     renderGraphiQL({
      //       endpoint: "/graphql",
      //     })
      //   )).type("text/html");
      // }

      const { operationName, query, variables } = getGraphQLParameters(request);

      const result = await processRequest({
        request,
        schema,
        operationName,
        query,
        variables,
      });

      await sendResult(result, req.raw.res);
    }
  })

  await server.start();
  console.log(`Serve on ${server.info.uri}`);
}

export const startFastify = async () => {
  const server = Fastify({
    logger: false,
  });

  // other register

  // http routes register
  server.register(routes)

  // graphql endpoint register
  server.route({
    method: ["POST", "GET"],
    url: "/graphql",
    handler: async (req, reply) => {
      const request: Request = {
        headers: req.headers,
        method: req.method,
        query: req.query,
        body: req.body,
      };

      if (shouldRenderGraphiQL(request)) {
        reply.header("Content-Type", "text/html");
        reply.send(
          renderGraphiQL({
            endpoint: "/graphql",
          })
        );
        return;
      }

      const { operationName, query, variables } = getGraphQLParameters(request);

      const result = await processRequest({
        request,
        schema,
        operationName,
        query,
        variables,
      });

      await sendResult(result, reply.raw);
    }
  });

  server.listen({ port: 8777, host: "0.0.0.0" }, (_, address) => { console.log(`Server is running at ${address}`); });
}

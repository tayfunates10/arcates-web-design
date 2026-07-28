import fs from "node:fs";
import http from "node:http";
import https from "node:https";

const keyPath = process.env.QA_TLS_KEY;
const certPath = process.env.QA_TLS_CERT;
const target = new URL(process.env.QA_TARGET ?? "http://127.0.0.1:3000");
const listenHost = process.env.QA_PROXY_HOST ?? "127.0.0.1";
const listenPort = Number(process.env.QA_PROXY_PORT ?? "3443");

if (!keyPath || !certPath) {
  throw new Error("QA_TLS_KEY ve QA_TLS_CERT zorunludur.");
}
if (target.protocol !== "http:") {
  throw new Error("QA proxy hedefi yalnızca yerel HTTP origin olabilir.");
}
if (!Number.isInteger(listenPort) || listenPort < 1 || listenPort > 65_535) {
  throw new Error("QA_PROXY_PORT geçerli bir port olmalıdır.");
}

const server = https.createServer(
  {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  },
  (request, response) => {
    const forwardedHost = request.headers.host ?? `${listenHost}:${listenPort}`;
    const proxyRequest = http.request(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port || 80,
        method: request.method,
        path: request.url,
        headers: {
          ...request.headers,
          host: target.host,
          "x-forwarded-host": forwardedHost,
          "x-forwarded-proto": "https",
          "x-forwarded-for": request.socket.remoteAddress ?? "127.0.0.1",
        },
      },
      (proxyResponse) => {
        response.writeHead(proxyResponse.statusCode ?? 502, proxyResponse.headers);
        proxyResponse.pipe(response);
      },
    );

    proxyRequest.on("error", (error) => {
      console.error("QA HTTPS proxy request failed", error);
      if (!response.headersSent) response.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
      response.end("Bad Gateway");
    });

    request.pipe(proxyRequest);
  },
);

server.on("clientError", (error, socket) => {
  console.error("QA HTTPS proxy client error", error);
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

server.listen(listenPort, listenHost, () => {
  console.log(`QA HTTPS proxy listening on https://${listenHost}:${listenPort} -> ${target.origin}`);
});

function shutdown(signal) {
  console.log(`QA HTTPS proxy received ${signal}`);
  server.close((error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
    process.exit();
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

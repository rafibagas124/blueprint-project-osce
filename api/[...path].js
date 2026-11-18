"use strict";

const { app } = require("../server");

module.exports = function vercelApiHandler(req, res) {
  const requestUrl = req.url || "/";
  const requestPath = requestUrl.split("?")[0];

  if (!/^\/api(?:\/|$)/.test(requestPath)) {
    req.url = `/api${requestUrl.startsWith("/") ? "" : "/"}${requestUrl}`;
  }

  return app(req, res);
};

const logger = (req, res, next) => {
  const start = Date.now();

  const originalSend = res.send;
  res.send = function (body) {
    this.body = body;
    originalSend.call(this, body);
  };

  res.on("finish", () => {
    const end = Date.now();
    const duration = end - start;

    console.log(`
      --------------------------------------------------------
      Request: ${req.method} ${req.originalUrl}
      Headers: ${JSON.stringify(req.headers)}
      Body:    ${req.method === "GET" ? "N/A" : JSON.stringify(req.body)}
      --------------------------------------------------------
      Response: ${res.statusCode} ${res.statusMessage}
      Response Body: ${res.body ? JSON.stringify(res.body) : "N/A"}
      Duration: ${duration}ms
      --------------------------------------------------------
      `);
  });

  next();
};

module.exports = logger;

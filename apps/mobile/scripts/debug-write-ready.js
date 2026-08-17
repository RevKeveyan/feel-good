const fs = require("fs");
const path = require("path");
const line = JSON.stringify({
  sessionId: "68a871",
  runId: "post-fix",
  hypothesisId: "A",
  location: "status-check",
  message: "project_ready",
  data: {
    status: "ACTIVE_HEALTHY",
    dns: "172.64.149.246",
    healthHttp: 401,
    note: "401 on /auth/v1/health means host reachable",
  },
  timestamp: Date.now(),
});
fs.appendFileSync(path.join(__dirname, "..", "..", "..", "debug-68a871.log"), line + "\n");
console.log(line);

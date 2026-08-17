const fs = require("fs");
const path = require("path");
const logPath = path.join(__dirname, "..", "..", "..", "debug-68a871.log");
const line = JSON.stringify({
  sessionId: "68a871",
  runId: "analysis",
  hypothesisId: "A",
  location: "debug-analysis",
  message: "root_cause",
  data: {
    A: "CONFIRMED",
    B: "REJECTED",
    C: "REJECTED",
    D: "CONFIRMED_symptom",
    evidence: "projects list status=INACTIVE for bruvmdcstlkszvjruska; DNS ENOTFOUND; cloudflare 200",
    fix: "Resume project in Supabase Dashboard",
  },
  timestamp: Date.now(),
});
fs.appendFileSync(logPath, line + "\n");
console.log(line);

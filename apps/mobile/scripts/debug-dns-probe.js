const fs = require("fs");
const dns = require("dns").promises;
const path = require("path");

const logPath = path.join(__dirname, "..", "..", "..", "debug-68a871.log");
const host = "bruvmdcstlkszvjruska.supabase.co";

function write(hypothesisId, message, data) {
  const line = JSON.stringify({
    sessionId: "68a871",
    runId: "pre-fix-host",
    hypothesisId,
    location: "scripts/debug-dns-probe.js",
    message,
    data,
    timestamp: Date.now(),
  });
  fs.appendFileSync(logPath, line + "\n");
  console.log(line);
}

(async () => {
  try {
    const addrs = await dns.lookup(host, { all: true });
    write("A", "dns_lookup_ok", { host, addrs });
  } catch (e) {
    write("A", "dns_lookup_failed", {
      host,
      code: e.code,
      error: e.message,
    });
  }
  try {
    const ctrl = await fetch("https://www.cloudflare.com/cdn-cgi/trace");
    write("C", "host_control_fetch", { ok: ctrl.ok, status: ctrl.status });
  } catch (e) {
    write("C", "host_control_fetch_failed", { error: String(e.message || e) });
  }
  try {
    const res = await fetch(`https://${host}/auth/v1/health`);
    write("A", "host_supabase_fetch", { ok: res.ok, status: res.status });
  } catch (e) {
    write("A", "host_supabase_fetch_failed", { error: String(e.message || e) });
  }
})();

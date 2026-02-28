import { startServer } from "./web/server.ts";

// - add helmet
// - add health checker (liveness, ready) + metrics
// - add rate limit
// - add not accept unknown params
// - event driven
startServer();

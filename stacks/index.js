import RDSStack from "./RDSStack";
import CronStack from "./CronStack";
import AuthStack from "./AuthStack";
import FrontendStack from "./FrontendStack";

export default function main(app) {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs14.x",
  });

  const rdsStack = new RDSStack(app, "rds-stack");

  new CronStack(app, "cron-stack", {
    database: rdsStack.DATABASE,
    cluster: rdsStack.cluster,
  });

  const authStack = new AuthStack(app, "auth-stack");

  new FrontendStack(app, "frontend", {
    auth: authStack.auth,
  });
}

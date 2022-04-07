import * as sst from "@serverless-stack/resources";

export default class RDSStack extends sst.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    this.DATABASE = "NFTMonitorDB";

    // Create the Aurora DB cluster
    this.cluster = new sst.RDS(this, "Cluster", {
      engine: "postgresql10.14",
      defaultDatabaseName: this.DATABASE,
      migrations: "src/migrations",
    });

    // Show the resource info in the output
    this.addOutputs({
      SecretArn: this.cluster.secretArn,
      ClusterIdentifier: this.cluster.clusterIdentifier,
    });
  }
}

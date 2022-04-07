import * as sst from "@serverless-stack/resources";
import { RuleTargetInput } from "aws-cdk-lib/aws-events";

export default class CronStack extends sst.Stack {
  constructor(scope, id, rdsStack) {
    super(scope, id);

    const topic = new sst.Topic(this, "Price_Changed", {
      subscribers: ["src/price-changed.main"],
    });

    // Create Cron Job
    const cron = new sst.Cron(this, "Cron", {
      schedule: "rate(1 minute)",
      job: {
        function: "src/lambda.main",
        jobProps: {
          event: RuleTargetInput.fromObject({
            topicArn: topic.snsTopic.topicArn,
            database: rdsStack.database,
            clusterArn: rdsStack.cluster.clusterArn,
            secretArn: rdsStack.cluster.secretArn,
          }),
        },
      },
    });

    topic.attachPermissions(["ses:SendEmail"]);
    cron.attachPermissions([topic, rdsStack.cluster]);
  }
}

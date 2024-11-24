import * as cdk from 'aws-cdk-lib';
import { AttributeType, Table, BillingMode, GlobalSecondaryIndexProps, StreamViewType } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime, StartingPosition } from 'aws-cdk-lib/aws-lambda';
import { DynamoEventSource, S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { Subscription, SubscriptionProtocol, Topic } from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsExamStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'Bucket', {
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })

    const table = new Table(this, 'Table', {
      partitionKey:{
        name: 'id',
        type: AttributeType.STRING
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
    })

    const fileName: GlobalSecondaryIndexProps = {
      indexName: 'FileName',
      partitionKey: {
        name: 'FileNamePK',
        type: AttributeType.STRING
      }
    }

    table.addGlobalSecondaryIndex(fileName)

    const errorTopic = new Topic(this, 'ErrorTopic', {
      topicName: 'ErrorTopic'
    })

    new Subscription(this, 'ErrorSubscription', {
      topic: errorTopic,
      protocol: SubscriptionProtocol.EMAIL,
      endpoint: 'angel.arshev.97@gmail.com'
    })

    const populateFunction = new NodejsFunction(this, 'populateFunction', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: `${__dirname}/../src/populateFunction.ts`,
      functionName: 'PopulateFunction',
      environment: {
        TABLE_NAME: table.tableName,
        TOPIC_ARN: errorTopic.topicArn
      }
    })

    const notifyOnSuccess = new NodejsFunction(this, 'notifyOnSuccess', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: `${__dirname}/../src/notifyOnSuccess.ts`,
      functionName: 'NotifyOnSuccess',
      environment: {
        TOPIC_ARN: errorTopic.topicArn
      }
    })

    errorTopic.grantPublish(populateFunction)
    errorTopic.grantPublish(notifyOnSuccess)
    table.grantReadWriteData(populateFunction)

    const s3PutEventSource = new S3EventSource(bucket, {
      events: [
        EventType.OBJECT_CREATED_PUT
      ]
    });

    populateFunction.addEventSource(s3PutEventSource);

    notifyOnSuccess.addEventSource(new DynamoEventSource(table, {
      startingPosition: StartingPosition.LATEST,
    }));
  }
}

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({})
const dynamoDBClient = new DynamoDBClient({})

export const handler = async (event: any) => {
    const topicArn = process.env.TOPIC_ARN;
    const extensionName = event.Records[0].s3.object.key.slice(-4);

    if(extensionName === '.pdf' || extensionName === '.jpg' || extensionName === '.png'){
        console.log("right format")
    }else{ 
        await snsClient.send(new PublishCommand({
            TopicArn: topicArn,
            Message: 'Invalid file deployed. You can deploy only .png, .jpg or .pdf files'
        }))
    }
}
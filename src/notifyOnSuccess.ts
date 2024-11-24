import { PublishCommand, SNSClient } from "@aws-sdk/client-sns"
const snsClient = new SNSClient({})

export const handler = async (event: any) => {
    const topicArn = process.env.TOPIC_ARN;
    const extensionName = event.Records[0].dynamodb.NewImage.fileExtension.S
    const size = event.Records[0].dynamodb.NewImage.fileSize.S
    const date = event.Records[0].dynamodb.NewImage.dateAdded.S

    await snsClient.send(new PublishCommand({
        TopicArn: topicArn,
        Message: `You have uploaded a file with extention ${extensionName} with size - ${size} on ${date}`
    }))
}
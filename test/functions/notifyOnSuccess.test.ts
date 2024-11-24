import { handler } from "../../src/notifyOnSuccess"

const mockEvent = {
    Records: [{
        dynamodb: {
            NewImage: {
                fileExtension : {
                    S : '.png'
                },
                fileSize : {
                    S : '4'
                },
                dateAdded : {
                    S : '24.11.24'
                }
            }
        }
    }]
}

describe('notifyOnSuccess', () => {
    test('positive test', async () => {
        expect(await handler(mockEvent)).toHaveBeenCalledWith(mockEvent)
    })
})
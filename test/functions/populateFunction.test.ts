import { handler } from "../../src/populateFunction"

const mockEvent = {
    Records: [{
        s3: {
            object: {
                key: 'test.png',
                size: 4
            }
        }
    }]
}

describe('populateFunction', () => {
    test('positive test', async () => {
        expect(await handler(mockEvent)).toHaveBeenCalledWith(mockEvent)
    })
})
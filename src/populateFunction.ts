export const handler = async (event: any) => {
    const extensionName = event.Records[0].s3.object.key.slice(-4);

    if(extensionName === '.pdf' || extensionName === '.jpg' || extensionName === '.png'){
        console.log("right format")
    }else{ 
        console.log("wrong format")
    }
}
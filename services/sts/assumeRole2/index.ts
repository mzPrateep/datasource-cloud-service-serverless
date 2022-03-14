import { AWSError } from 'aws-sdk'
import { AssumeRoleResponse, AssumeRoleRequest } from 'aws-sdk/clients/sts'
import * as AWS from 'aws-sdk'

const assumeRole2 = async (params: any, credentials: any, region: string): Promise<AssumeRoleResponse | AWSError> => {
    return new Promise(resolve => {
        let req: AssumeRoleRequest = {
            RoleArn: params.RoleArn,
            RoleSessionName: params.RoleSessionName
        }
        AWS.config.update({
            region: region,
            accessKeyId: credentials.AccessKeyId,
            secretAccessKey: credentials.SecretAccessKey,
            sessionToken: credentials.SessionToken
        })
        const STS = new AWS.STS()
        STS.assumeRole(req, (err, data) => {
            if (err) {
                console.log('Error Assume Role: ', err,'  ',  err.stack) // an error occurred
                resolve(err)
            } else {
                // console.log(data)// successful response
                resolve(data)
            }
        })
    })
}
export { assumeRole2 }

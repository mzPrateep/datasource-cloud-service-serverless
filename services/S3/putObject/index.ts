import { S3 } from '../../../configs/awsProviderLocalSet'
import { AWSError } from 'aws-sdk'
import { PutObjectRequest, PutObjectAclOutput } from 'aws-sdk/clients/s3'

const putObject = async (params: any): Promise<PutObjectAclOutput | AWSError> => {
    return new Promise(resolve => {
        let req: PutObjectRequest = {
            Body: params.Body,
            Bucket: params.Bucket,
            Key: params.Key,
            ACL: params.ACL
        }
        S3.putObject(req, (err, data) => {
            if (err) {
                console.log(err, err.stack); // an error occurred
                resolve(err)
            } else {
                console.log(data);// successful response
                resolve(data)
            }
        })
    })
}
export { putObject }

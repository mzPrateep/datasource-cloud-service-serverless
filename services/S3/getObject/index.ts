import { S3 } from '../../../configs/awsProviderLocalSet'
import { AWSError } from 'aws-sdk'
import { GetObjectRequest, GetObjectAclOutput } from 'aws-sdk/clients/s3'

const getObject = async (params: any): Promise<GetObjectAclOutput | AWSError> => {
    return new Promise(resolve => {
        let req: GetObjectRequest = {
            Bucket: params.Bucket,
            Key: params.Key
        }
        S3.getObject(req, (err, data) => {
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
export { getObject }

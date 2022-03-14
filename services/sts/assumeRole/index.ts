import { STS } from '../../../configs/awsProvider'
import { AWSError } from 'aws-sdk'
import { AssumeRoleResponse, AssumeRoleRequest } from 'aws-sdk/clients/sts'

const assumeRole = async (params: any): Promise<AssumeRoleResponse | AWSError> => {
    return new Promise(resolve => {
        let req: AssumeRoleRequest = {
            RoleArn: params.RoleArn,
            RoleSessionName: params.RoleSessionName
        }
        STS.assumeRole(req, (err, data) => {
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
export { assumeRole }

import * as AWS from 'aws-sdk';

import { AWSError } from 'aws-sdk'
import { DescribeInstancesResult, DescribeInstancesRequest } from 'aws-sdk/clients/ec2'

const describeInstances = async (params: any, region, credentials): Promise<DescribeInstancesResult | AWSError> => {
    return new Promise(resolve => {
        console.log("params : ", params);
        AWS.config.update({
            region,
            accessKeyId: credentials.AccessKeyId,
            secretAccessKey: credentials.SecretAccessKey,
            sessionToken: credentials.SessionToken
        });
        const EC2 = new AWS.EC2()

        let req: DescribeInstancesRequest = {
            InstanceIds: params.InstanceIds
        }

        // console.log("req : ", req);

        EC2.describeInstances(req, (err, data) => {
            if (err) {
                console.log(err, err.stack); // an error occurred
                resolve(err)
            } else {
                console.log("data : ", data);// successful response
                resolve(data)
            }
        })
    })
}

export { describeInstances }

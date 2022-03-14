import * as AWS from 'aws-sdk';

import { AWSError } from 'aws-sdk'
import { ListAccountsRequest, ListAccountsResponse } from 'aws-sdk/clients/organizations'

const listAccounts = async (params: any, credentials, NextToken): Promise<ListAccountsRequest | AWSError> => {
    return new Promise(resolve => {
        console.log("params : ", params);
        AWS.config.update({
            region: "us-east-1",
            accessKeyId: credentials.AccessKeyId,
            secretAccessKey: credentials.SecretAccessKey,
            sessionToken: credentials.SessionToken
        });


        var organizations = new AWS.Organizations();

        let req: ListAccountsResponse = {
            NextToken
        }

        // console.log("req : ", req);

        organizations.listAccounts(req, (err, data) => {
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

export { listAccounts }

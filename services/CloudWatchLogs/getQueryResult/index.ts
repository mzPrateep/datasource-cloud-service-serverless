import { CloudWatchLogs } from '../../../configs/awsProvider'
import { AWSError } from 'aws-sdk'
import { GetQueryResultsResponse, GetQueryResultsRequest } from 'aws-sdk/clients/cloudwatchlogs'
import * as fs from "fs"
const getQueryResults = async (params: any): Promise<GetQueryResultsResponse | AWSError> => {
    return new Promise(resolve => {
        let req: GetQueryResultsRequest = {
            queryId: params.queryId,
        }

        CloudWatchLogs.getQueryResults(req, (err, data) => {
            if (err) {
                console.log("err : ", err, err.stack); // an error occurred
                resolve(err)
            } else {
                console.log("data : ", data);// successful response
                fs.writeFile("nodesk8sApi.json", JSON.stringify(data.results), (err) => {
                    if (err) {
                        throw err;
                    }
                    console.log("JSON data is saved.");
                });
                resolve(data)
            }
        })
    })
}
// 118331851
let params = { queryId: 'a451c65c-c3f3-41e7-814d-4c90811279b9' }
getQueryResults(params)
// export { getQueryResults }
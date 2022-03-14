import { CloudWatchLogs } from '../../../configs/awsProvider'
import { AWSError } from 'aws-sdk'
import { StopQueryResponse, StopQueryRequest } from 'aws-sdk/clients/cloudwatchlogs'

const stopQuery = async (params: any): Promise<StopQueryResponse | AWSError> => {
    return new Promise(resolve => {
        let req: StopQueryRequest = {
            queryId: params.queryId,
        }

        CloudWatchLogs.stopQuery(req, (err, data) => {
            if (err) {
                console.log("err : ", err, err.stack); // an error occurred
                resolve(err)
            } else {
                console.log("data : ", data);// successful response
                resolve(data)
            }
        })
    })
}
// let params = { queryId: '4bd7fbaa-f437-4fc8-ab80-a338eb8691a5' }
// stopQuery(params)
export { stopQuery }
import { CloudWatchLogs } from '../../../configs/awsProvider'
import { AWSError } from 'aws-sdk'
import { StartQueryResponse, StartQueryRequest } from 'aws-sdk/clients/cloudwatchlogs'

const startQuery = async (params: any): Promise<StartQueryResponse | AWSError> => {
    return new Promise(resolve => {
        let req: StartQueryRequest = {
            endTime: params.endTime,
            queryString: params.queryString,
            startTime: params.startTime,
            logGroupNames: params.logGroupNames
        }

        CloudWatchLogs.startQuery(req, (err, data) => {
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
let params = {
    endTime: 1625736532,
    startTime: 1625736530,
    queryString: 'fields @logStream, @ingestionTime, @message, @log',
    logGroupNames: [
        '/aws/eks/arthit-cluster/cluster',
    ]
}
startQuery(params)
// export { startQuery }
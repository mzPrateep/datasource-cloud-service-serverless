import { Athena } from '../../../configs/awsProviderLocalSet'
import { AWSError } from 'aws-sdk'
import { GetQueryResultsInput, GetQueryResultsOutput } from 'aws-sdk/clients/athena'

const getQueryResults = async (params: any): Promise<GetQueryResultsOutput | AWSError> => {
    return new Promise(resolve => {
        console.log("params : ", params);

        let req: GetQueryResultsInput = {
            QueryExecutionId: params.QueryExecutionId,
            NextToken: params.NextToken || null
        }
        if (params.MaxResults) {
            req.MaxResults = params.MaxResults
        }
        // console.log("req : ", req);

        Athena.getQueryResults(req, (err, data) => {
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
// let params = {}
// getQueryResults(params)
export { getQueryResults }

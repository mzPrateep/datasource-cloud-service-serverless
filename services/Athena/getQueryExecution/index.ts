import { Athena } from '../../../configs/awsProviderLocalSet'
import { AWSError } from 'aws-sdk'
import { GetQueryExecutionInput, GetQueryExecutionOutput } from 'aws-sdk/clients/athena'

const getQueryExecution = async (params: any): Promise<GetQueryExecutionOutput | AWSError> => {
    return new Promise(resolve => {
        console.log("params : ", params);

        let req: GetQueryExecutionInput = {
            QueryExecutionId: params.QueryExecutionId,

        }

        // console.log("req : ", req);

        Athena.getQueryExecution(req, (err, data) => {
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
export { getQueryExecution }

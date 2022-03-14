import { Athena } from '../../../configs/awsProviderLocalSet'
import { AWSError } from 'aws-sdk'
import { StartQueryExecutionInput, StartQueryExecutionOutput } from 'aws-sdk/clients/athena'

const startQueryExecution = async (params: any): Promise<StartQueryExecutionOutput | AWSError> => {
    return new Promise(resolve => {
        console.log("params : ", params);

        let req: StartQueryExecutionInput = {
            QueryString: params.QueryString,
            WorkGroup: params.WorkGroup,
            ResultConfiguration: params.ResultConfiguration
        }
        Athena.startQueryExecution(req, (err, data) => {
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
// startQueryExecution(params)
export { startQueryExecution }

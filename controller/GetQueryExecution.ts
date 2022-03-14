import { GetQueryExecutionProps } from '../interfaces/GetQueryExecution'
import { getQueryExecution } from '../services/Athena/getQueryExecution'
import { AWSError } from 'aws-sdk'
import { GetQueryExecutionOutput } from 'aws-sdk/clients/athena'

class GetQueryExecution {
    QueryExecutionId: string;

    constructor() {
        this.QueryExecutionId = " "

    }

    setData(params: GetQueryExecutionProps) {
        this.QueryExecutionId = params.QueryExecutionId

    }
    async GetQueryExecution(params?: any): Promise<GetQueryExecutionOutput | AWSError> {
        try {
            let paramsgetQueryExecution = {
                QueryExecutionId: params.QueryExecutionId,

            }
            let getQueryExecution_log = await getQueryExecution(paramsgetQueryExecution)
            console.log("getQueryExecution_log : ", getQueryExecution_log);


            return getQueryExecution_log;

        } catch (error) {
            return error.stack;
        }
    }

}
export default GetQueryExecution
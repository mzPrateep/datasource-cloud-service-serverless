import { GetQueryResultsProps } from '../interfaces/GetQueryResults'
import { getQueryResults } from '../services/Athena/getQueryResults'
import { AWSError } from 'aws-sdk'
import { GetQueryResultsOutput } from 'aws-sdk/clients/athena'

class GetQueryResults {
    QueryExecutionId: string;
    NextToken: string;
    MaxResults: string;

    constructor() {
        this.QueryExecutionId = " "
        this.NextToken = " "
        this.MaxResults = " "
    }

    setData(params: GetQueryResultsProps) {
        this.QueryExecutionId = params.QueryExecutionId
        this.MaxResults = params.MaxResults
        this.NextToken = params.NextToken
    }
    async GetQueryResults(params?: any): Promise<GetQueryResultsOutput | AWSError> {
        try {
            let paramsGetQueryResults = {
                QueryExecutionId: params.QueryExecutionId,
                MaxResults: params.MaxResults,
                NextToken: params.NextToken
            }
            let GetQueryResults_log = await getQueryResults(paramsGetQueryResults)
            console.log("GetQueryResults_log : ", GetQueryResults_log);


            return GetQueryResults_log;

        } catch (error) {
            return error.stack;
        }
    }

}
export default GetQueryResults
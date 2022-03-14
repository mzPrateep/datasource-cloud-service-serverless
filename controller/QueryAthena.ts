import { QueryAthenaProps } from '../interfaces/QueryAthena'
import { startQueryExecution } from '../services/Athena/startQueryExecution'
import { AWSError } from 'aws-sdk'
import { StartQueryExecutionOutput } from 'aws-sdk/clients/athena'

class QueryAthena {
    startTime: string;
    endTime: string;
    verb: string;
    constructor() {
        this.startTime = " "
        this.endTime = " "
        this.verb = " "
    }

    setData(params: QueryAthenaProps) {
        this.startTime = params.startTime
        this.endTime = params.endTime
        this.verb = params.verb
    }
    async QueryAthena(params?: any): Promise<StartQueryExecutionOutput | AWSError> {
        try {
            var QueryString = `SELECT * FROM "default"."ppaauditlog" WHERE (timestamp between TIMESTAMP '${params.startTime}' and TIMESTAMP '${params.endTime}')`
            if (params.verb) {
                QueryString += ` and (verb = '${params.verb}')`
            }
            let paramsSQE = {
                QueryString: QueryString,
                WorkGroup: "primary",
                ResultConfiguration: {
                    OutputLocation: 's3://athena-ppa-output'
                }
            }
            let startQueryExecution_log = await startQueryExecution(paramsSQE)
            console.log("startQueryExecution_log : ", startQueryExecution_log);


            return startQueryExecution_log;

        } catch (error) {
            return error.stack;
        }
    }

}
export default QueryAthena
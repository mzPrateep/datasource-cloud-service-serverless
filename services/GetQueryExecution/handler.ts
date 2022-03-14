import { Callback, Context } from 'aws-lambda';

import GetQueryExecutionController from '../../controller/GetQueryExecution'
import Success from '../../controller/Success'
import Error from '../../controller/Error'

const getQueryExecution = async (event?: any, _?: Context, callback?: Callback) => {
    try {
        console.log("event : ", event);

        /**
         * @description
         * @params {RoleArn : "string", RoleSessionName : "string"} 
         */

        const { queryExecutionId } = event.query

        let params = {
            QueryExecutionId: queryExecutionId
        }
        let GetQueryExecution = await new GetQueryExecutionController().GetQueryExecution(params)
        const GetQueryExecution_res: any = GetQueryExecution


        if (GetQueryExecution_res.code) {
            return callback(JSON.stringify(
                new Error(
                    400,
                    GetQueryExecution_res.message,
                    'GetQueryExecution'
                )
            ));
        } else {
            return new Success(GetQueryExecution_res)
        }

    } catch (error) {
        return callback(JSON.stringify(
            new Error(
                400,
                JSON.stringify(error.stack),
                'GetQueryExecution'
            )
        ));
    }
}

export const main = getQueryExecution;
import { Callback, Context } from 'aws-lambda';

import QueryAthenaController from '../../controller/QueryAthena'
import Success from '../../controller/Success'
import Error from '../../controller/Error'

const queryAuditLog = async (event?: any, _?: Context, callback?: Callback) => {
    try {
        console.log("event : ", event);

        /**
         * @description
         * @params {RoleArn : "string", RoleSessionName : "string"} 
         */

        const { startTime, endTime, verb } = event.query

        let params = {
            startTime: startTime,
            endTime: endTime,
            verb: verb
        }
        let QueryAthena = await new QueryAthenaController().QueryAthena(params)
        const QueryAthena_res: any = QueryAthena


        if (QueryAthena_res.code) {
            return callback(JSON.stringify(
                new Error(
                    400,
                    QueryAthena_res.message,
                    'QueryAthena'
                )
            ));
        } else {
            return new Success(QueryAthena_res)
        }

    } catch (error) {
        return callback(JSON.stringify(
            new Error(
                400,
                JSON.stringify(error.stack),
                'QueryAthena'
            )
        ));
    }
}

export const main = queryAuditLog;
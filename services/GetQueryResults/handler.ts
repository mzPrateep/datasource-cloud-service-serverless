import { Callback, Context } from 'aws-lambda';

import GetQueryResultsController from '../../controller/GetQueryResults'
import Success from '../../controller/Success'
import Error from '../../controller/Error'

const getQueryResults = async (event?: any, _?: Context, callback?: Callback) => {
    try {
        console.log("event : ", event);

        /**
         * @description
         * @params {RoleArn : "string", RoleSessionName : "string"} 
         */

        const { queryExecutionId, nextToken, maxResults } = event.body

        let params = {
            QueryExecutionId: queryExecutionId, NextToken: nextToken, MaxResults: maxResults
        }
        let GetQueryResults = await new GetQueryResultsController().GetQueryResults(params)
        const GetQueryResults_res: any = GetQueryResults


        if (GetQueryResults_res.code) {
            return callback(JSON.stringify(
                new Error(
                    400,
                    GetQueryResults_res.message,
                    'getQueryResults'
                )
            ));
        } else {
            let tmp = []
            var i = 0
            if (!nextToken || nextToken == null || nextToken == '') {
                i = 1
            }
            for (i; i < GetQueryResults_res.ResultSet.Rows.length; i++) {
                let object = {}
                for (let k in GetQueryResults_res.ResultSet.ResultSetMetadata.ColumnInfo) {
                    object[`${GetQueryResults_res.ResultSet.ResultSetMetadata.ColumnInfo[k].Name}`] = GetQueryResults_res.ResultSet.Rows[i].Data[k].VarCharValue
                }
                // console.log("object : ", object);

                tmp.push(object)
            }

            delete GetQueryResults_res.ResultSet
            GetQueryResults_res.Objects = tmp
            return new Success(GetQueryResults_res)
        }

    } catch (error) {
        return callback(JSON.stringify(
            new Error(
                400,
                JSON.stringify(error.stack),
                'getQueryResults'
            )
        ));
    }
}

export const main = getQueryResults;
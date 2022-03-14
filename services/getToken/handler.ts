import { Callback, Context } from 'aws-lambda';

import GetTokenController from '../../controller/GetToken'
import Success from '../../controller/Success'
import Error from '../../controller/Error'

const getToken = async (event?: any, _?: Context, callback?: Callback) => {
    try {
        console.log("event : ", event);

        /**
         * @description
         * @params {RoleArn : "string", RoleSessionName : "string"} 
         */

        const { accessKeyId, secretAccessKey, sessionToken, clusterName, region } = event.body

        let params = {
            accessKeyId,
            secretAccessKey,
            sessionToken,
            clusterName,
            region
        }
        let switchRole = await new GetTokenController().GetToken(params)
        const SwitchRole_res: any = switchRole


        if (SwitchRole_res.code) {
            return callback(JSON.stringify(
                new Error(
                    400,
                    SwitchRole_res.message,
                    'getToken'
                )
            ));
        } else {
            return new Success(SwitchRole_res)
        }

    } catch (error) {
        return callback(JSON.stringify(
            new Error(
                400,
                JSON.stringify(error.stack),
                'getToken'
            )
        ));
    }
}

export const main = getToken;
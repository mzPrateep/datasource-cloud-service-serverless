import { Callback, Context } from 'aws-lambda';

import SwitchRolerController from '../../controller/SwitchRole'
import Success from '../../controller/Success'
import Error from '../../controller/Error'

const switchRole = async (event?: any, _?: Context, callback?: Callback) => {
    try {
        console.log("event : ", event);

        /**
         * @description
         * @params {RoleArn : "string", RoleSessionName : "string"} 
         */

        const { rolearn: RoleArn, rolesessionname: RoleSessionName } = event.headers

        let params = {
            RoleArn,
            RoleSessionName
        }
        let switchRole = await new SwitchRolerController().SwitchRole(params)
        const SwitchRole_res: any = switchRole


        if (SwitchRole_res.code) {
            return callback(JSON.stringify(
                new Error(
                    400,
                    SwitchRole_res.message,
                    'SwitchRole'
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
                'SwitchRole'
            )
        ));
    }
}

export const main = switchRole;
import { Callback, Context } from 'aws-lambda';

import GetAutoScalingGroupNamesSI from '../../controller/GetAutoScalingGroupNamesSI'
import Success from '../../controller/Success'
import Error from '../../controller/Error'

const getAutoScalingGroupNames = async (event?: any, _?: Context, callback?: Callback) => {
    try {
        console.log("event : ", event);

        const { instanceIds,
            region,
            accountId,
            iamRole } = event.body

        let params = {
            InstanceIds: instanceIds,
            region,
            accountId,
            iamRole
        }
        let getAutoScalingGroupNames: any = await new GetAutoScalingGroupNamesSI().GetAutoScalingGroupNames(params)
        console.log("getAutoScalingGroupNames : ", getAutoScalingGroupNames);

        if (getAutoScalingGroupNames.code) {
            return callback(JSON.stringify(
                new Error(
                    400,
                    getAutoScalingGroupNames.message,
                    'GetAutoScalingGroupNames'
                )
            ));
        } else {
            return new Success(getAutoScalingGroupNames)
        }

    } catch (error) {
        return callback(JSON.stringify(
            new Error(
                400,
                JSON.stringify(error.stack),
                'GetAutoScalingGroupNames'
            )
        ));
    }
}
// let event = {
// body: {
//     instanceIds: [
//         "i-0fc2d56aad1299286",
//         "i-0ced3efaf819ffc03"
//     ],
//     region: "ap-southeast-1",
//     iamRole: "ppa_role",
//     accountId: "511781332892"
// }
// }
// getAutoScalingGroupNames(event)
export const main = getAutoScalingGroupNames;
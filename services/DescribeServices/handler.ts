
import DescribeServicesController from '../../controller/DescribeServices'
import Success from '../../controller/Success'
import Error from '../../controller/Error'
import { Callback, Context } from 'aws-lambda';

const describeServices = async (event?: any, _?: Context, callback?: Callback) => {
    try {
        console.log("event : ", event);
        const { instanceIds,
            region,
            accountId,
            iamRole, service } = event.body
        let params = {
            InstanceIds: instanceIds,
            region,
            accountId,
            iamRole,
            service
        }
        console.log("params : ", params);
        let describeServicesRES: any = await new DescribeServicesController().DescribeServices(params)
        console.log("describeServicesRES : ", describeServicesRES);
        if (describeServicesRES.code) {
            return callback(JSON.stringify(
                new Error(
                    400,
                    describeServicesRES.message,
                    'DescribeServices'
                )
            ));
        } else {
            return new Success(describeServicesRES)
        }

    } catch (error) {
        return callback(JSON.stringify(
            new Error(
                400,
                JSON.stringify(error.stack),
                'DescribeServices'
            )
        ))
    }
}
// let event = {
//     body: {
//         instanceIds: [
//             "i-0fc2d56aad1299286",
//             "i-0ced3efaf819ffc03"
//         ],
//         region: "ap-southeast-1",
//         accountId: "511781332892",
//         iamRole: "ppa_role",
//         service: "ec2"
//     }
// }
// describeServices(event)
export const main = describeServices;
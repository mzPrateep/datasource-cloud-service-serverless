import { DescribeInstancesProps } from '../interfaces/DescribeInstances'
import { describeInstances } from '../services/EC2/describeInstances'
import { assumeRole } from '../services/STS/assumeRole'


class GetAutoScalingGroupNamesSI {
    InstanceIds: Array<String>;
    region: String
    accountId: String
    iamRole: String
    setData(params: DescribeInstancesProps) {
        this.InstanceIds = params.InstanceIds
        this.region = params.region
        this.accountId = params.accountId
        this.iamRole = params.iamRole
    }
    async GetAutoScalingGroupNames(params?: any): Promise<any> {
        try {
            let paramsSwitchRole = {
                RoleArn: `arn:aws:iam::${params.accountId}:role/${params.iamRole}`,
                RoleSessionName: "SwitchForGetMetric"

            }
            let SwitchRole: any = await assumeRole(paramsSwitchRole)
            console.log("SwitchRole : ", SwitchRole);
            if (SwitchRole.code) {
                return SwitchRole
            }
            let paramsdescribeInstances = {
                InstanceIds: params.InstanceIds,

            }
            let describeInstances_log: any = await describeInstances(paramsdescribeInstances, params.region, SwitchRole.Credentials)
            console.log("describeInstances_log : ", describeInstances_log);


            let AutoScalingGroupNames = []
            // console.log("AutoScalingGroupNames : ", AutoScalingGroupNames);
            for (let i in describeInstances_log.Reservations) {
                for (let j in describeInstances_log.Reservations[i].Instances) {
                    let AutoScalingGroupName = (describeInstances_log.Reservations[i].Instances[j].IamInstanceProfile.Arn.split("/"))[1]
                    // console.log("AutoScalingGroupName : ", AutoScalingGroupName);
                    let index = AutoScalingGroupNames.findIndex(items => items == AutoScalingGroupName)

                    if (index == -1) {
                        AutoScalingGroupNames.push(AutoScalingGroupName)
                    }
                }

            }
            if (describeInstances_log.code) {
                return describeInstances_log

            } else {
                return AutoScalingGroupNames
            }

        } catch (error) {
            return error.stack;
        }
    }

}
export default GetAutoScalingGroupNamesSI
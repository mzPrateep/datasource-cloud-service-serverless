import { DescribeServicesProps } from '../interfaces/DescribeServices'
import { describeInstances } from '../services/EC2/describeInstances'
import { describeSecurityGroups } from '../services/EC2/describeSecurityGroups'

import { assumeRole } from '../services/STS/assumeRole'


class DescribeServices {
    InstanceIds: Array<String>;
    region: String
    accountId: String
    iamRole: String
    service: String
    setData(params: DescribeServicesProps) {
        this.InstanceIds = params.InstanceIds
        this.region = params.region
        this.accountId = params.accountId
        this.iamRole = params.iamRole
        this.service = params.service
    }
    async DescribeServices(params?: any): Promise<any> {
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

            switch (params.service) {
                case 'ec2': {
                    let paramsdescribeInstances = {
                        InstanceIds: params.InstanceIds,
                    }
                    let describeInstances_log: any = await describeInstances(paramsdescribeInstances, params.region, SwitchRole.Credentials)
                    // console.log("describeInstances_log : ", describeInstances_log);
                    let data = []
                    for (let i in describeInstances_log.Reservations) {
                        for (let j in describeInstances_log.Reservations[i].Instances) {
                            for (let k in describeInstances_log.Reservations[i].Instances[j].SecurityGroups) {
                                let GroupIds = []
                                GroupIds.push(describeInstances_log.Reservations[i].Instances[j].SecurityGroups[k].GroupId);
                                console.log("GroupIds : ", GroupIds);
                                let paramsDescribeSecurityGroups = {
                                    GroupIds
                                }
                                let describeSecurityGroupsRES: any = await describeSecurityGroups(paramsDescribeSecurityGroups, params.region, SwitchRole.Credentials)
                                describeInstances_log.Reservations[i].Instances[j].SecurityGroups[k].SecurityGroupsDetail = describeSecurityGroupsRES.SecurityGroups
                                // console.log("describeSecurityGroupsRES : ", describeSecurityGroupsRES);
                            }
                            data.push({
                                'accountId': params.accountId,
                                'hostName': 'hostname',
                                'instanceName': describeInstances_log.Reservations[i].Instances[j].Tags[i].Value,
                                'instanceId': describeInstances_log.Reservations[i].Instances[j].InstanceId,
                                'privateIP': describeInstances_log.Reservations[i].Instances[j].PrivateIpAddress,
                                'publicIP': describeInstances_log.Reservations[i].Instances[j].PublicIpAddress || 'n/a',
                                'instanceType': describeInstances_log.Reservations[i].Instances[j].InstanceType,
                                'instanceState': describeInstances_log.Reservations[i].Instances[j].State.Name,
                                'imageId': describeInstances_log.Reservations[i].Instances[j].ImageId,
                                'launchTime': describeInstances_log.Reservations[i].Instances[j].LaunchTime,
                                'placement': describeInstances_log.Reservations[i].Instances[j].Placement,
                                'state': describeInstances_log.Reservations[i].Instances[j].State,
                                'subnetId': describeInstances_log.Reservations[i].Instances[j].SubnetId,
                                'vpcId': describeInstances_log.Reservations[i].Instances[j].VpcId,
                                'architecture': describeInstances_log.Reservations[i].Instances[j].Architecture,
                                'networkInterfaces': describeInstances_log.Reservations[i].Instances[j].NetworkInterfaces,
                                'securityGroups': describeInstances_log.Reservations[i].Instances[j].SecurityGroups

                            })


                        }
                    }
                    return data

                }
            }

        } catch (error) {
            return error.stack;
        }
    }

}
export default DescribeServices
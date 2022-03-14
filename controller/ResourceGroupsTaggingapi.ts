import { putObject } from '../services/S3/putObject'
import * as Moment from 'moment-timezone'
import * as MomentRange from 'moment-range'

const moment = MomentRange.extendMoment(Moment)
const currentYear = moment(new Date()).format('YYYY')
const currentMonth = moment(new Date()).format('MM')

const resourcegroupstaggingapi = {
    getResources: (resourcegroupstaggingapi, params: any = {}, region) => {
        return new Promise(resolve => {
            // var regionKey = {}
            let keepMoreData = { ResourceTagMappingList: [] }
            let currentRegion = region
            // console.log('GET RESOURCES >>>>>>>>>>>> ', resourcegroupstaggingapi, ' REGION >>>>> ', region)

            // ฟังก์ชั่น recursive
            async function onGetResource(err, data) {
                if (err) resolve({ success: false, message: `${ currentRegion } is not enabled.`, stack: err })
                else {
                    // console.log('RES DATA => ', data)
                    // เก็บ data
                    keepMoreData = {
                        ResourceTagMappingList: [
                            ...keepMoreData.ResourceTagMappingList,
                            ...data.ResourceTagMappingList
                        ]
                    }

                    if (data.PaginationToken !== '') {
                        // เรียกใช้ซ้ำถ้ามี pagination token
                        params.PaginationToken = data.PaginationToken
                        resourcegroupstaggingapi.getResources(params, onGetResource)
                    } else {
                        // จบ
                        params.PaginationToken = ''
                        // console.log(keepMoreData.ResourceTagMappingList)
                        // console.log(keepMoreData.ResourceTagMappingList)
                        // await listAllServices(keepMoreData.ResourceTagMappingList, stsKey)

                        // console.log(keepMoreData.ResourceTagMappingList[i].ResourceARN.split(':')[2])
                        // console.log('ELSE >>>>>>>>>> ', keepMoreData)
                        resolve({ success: true, data: keepMoreData })
                    }
                }
            }

            // เริ่ม
            resourcegroupstaggingapi.getResources(params, onGetResource)
        })
    }
}

const ec2 = {
    describeInstances: (ec2, arn = null, accountData = null) => {
        const data = []
        return new Promise(resolve => {
            //instance
            if (arn.indexOf(':instance/') != -1) {
                ec2.describeInstances({ InstanceIds: [ arn.split('/')[1] ] }, async (err, result) => {
                    if (err) {
                        console.log(err, err.stack)
                        resolve({ status: 400, err: err, success: false })
                    } else {
                        // console.log('result123', result.Reservations[0].Instances)
                        for (let i in result.Reservations[0].Instances[0].Tags) {
                            if (result.Reservations[0].Instances[0].Tags[i].Key == 'Name') {

                                ec2.describeSecurityGroups({ GroupIds: [ result.Reservations[0].Instances[0].SecurityGroups[0].GroupId ] }, async (err, resultSecurityGroups) => {
                                    if (err) {
                                        console.log(err, err.stack)
                                        resolve({ status: 400, err: err, success: false })
                                    } else {
                                        data.push({
                                            'Account Name': accountData.accountName,
                                            'Host Name': 'hostname',
                                            'Instance Name': result.Reservations[0].Instances[0].Tags[i].Value,
                                            'Instance ID': result.Reservations[0].Instances[0].InstanceId,
                                            'Private IP': result.Reservations[0].Instances[0].PrivateIpAddress,
                                            'Public IP': result.Reservations[0].Instances[0].PublicIpAddress || 'n/a',
                                            'Instance Type': result.Reservations[0].Instances[0].InstanceType,
                                            'Instance State': result.Reservations[0].Instances[0].State.Name,
                                            'ImageId': result.Reservations[0].Instances[0].ImageId,
                                            'LaunchTime': result.Reservations[0].Instances[0].LaunchTime,
                                            'Placement': result.Reservations[0].Instances[0].Placement,
                                            'State': result.Reservations[0].Instances[0].State,
                                            'SubnetId': result.Reservations[0].Instances[0].SubnetId,
                                            'VpcId': result.Reservations[0].Instances[0].VpcId,
                                            'Architecture': result.Reservations[0].Instances[0].Architecture,
                                            'NetworkInterfaces': result.Reservations[0].Instances[0].NetworkInterfaces,
                                            'SecurityGroups': resultSecurityGroups.SecurityGroups[0]

                                        })

                                        // console.log('data :', data)
                                        const jsonBuffer = await convertToJson(data[0])
                                        console.log('jsonBuffer :', jsonBuffer)

                                        const params = {
                                            Body: jsonBuffer,
                                            Bucket: "sentinel-userfile",
                                            Key: `Inventory/${ accountData.accountId }/${ accountData.accountName }/${ currentYear }/${ currentMonth }/ec2/${ arn.split('/')[1] }_${ currentYear }_${ currentMonth }.json`,
                                            ACL: 'public-read'
                                        }

                                        await putObject(params)

                                        resolve({ status: 200, data: data, success: true })
                                    }
                                })
                            }
                        }
                    }
                })
            } else {
                resolve([])
            }
        })
    },
}

const autoscaling = {
    describeAutoScalingInstances: (autoscaling, arn = null) => {
        return new Promise(resolve => {
            autoscaling.describeAutoScalingInstances({ InstanceIds: [ arn.split('/')[1] ] }, function (err, result) {
                if (err) {
                    // console.log(err, err.stack);
                    resolve({ status: 400, err: err, success: false })
                } else {
                    // resolve({ status: 200, data: result, success: true })
                    resolve(result)
                }
            })
        })
    },

    describeAutoScalingGroups: (autoscaling, autoScalingGroupData = null, accountData = null) => {
        // let data = []
        let data = {}
        console.log('IN Auto scaling groups: ', autoScalingGroupData.AutoScalingInstances)
        return new Promise(resolve => {
            if (autoScalingGroupData.AutoScalingInstances.length > 0) {
                autoscaling.describeAutoScalingGroups({ AutoScalingGroupNames: [ autoScalingGroupData.AutoScalingInstances[0].AutoScalingGroupName ] }, async (err, result) => {
                    if (err) {
                        console.log(err, err.stack)
                    } else {
                        // data.push({
                        //     'Account Name': accountData.accountName,
                        //     'Resource Name': result.AutoScalingGroups[0].AutoScalingGroupName,
                        //     'Launch Configuration': result.AutoScalingGroups[0].LaunchConfigurationName,
                        //     'Minimum Size': result.AutoScalingGroups[0].MinSize,
                        //     'Maximum Size': result.AutoScalingGroups[0].MaxSize,
                        //     'Availability Zones': result.AutoScalingGroups[0].AvailabilityZones[0] || '-',
                        // })
                        data = {
                            'Account Name': accountData.accountName,
                            'Resource Name': result.AutoScalingGroups[0].AutoScalingGroupName,
                            'Launch Configuration': result.AutoScalingGroups[0].LaunchConfigurationName,
                            'Minimum Size': result.AutoScalingGroups[0].MinSize,
                            'Maximum Size': result.AutoScalingGroups[0].MaxSize,
                            'Availability Zones': result.AutoScalingGroups[0].AvailabilityZones[0] || '-',
                        }
                        console.log('DATA => ', data)

                        // const jsonBuffer = await convertToJson(data[0])
                        //
                        // let params = {
                        //     Body: jsonBuffer,
                        //     Bucket: "sentinel-userfile",
                        //     Key: `Inventory/${ accountData.accountId }/${ accountData.accountName }/${ currentYear }/${ currentMonth }/AutoScalingGroups/${ autoScalingGroupData.AutoScalingInstances[0].AutoScalingGroupName }_${ currentYear }_${ currentMonth }.json`,
                        //     ACL: 'public-read'
                        // }
                        // await putObject(params)

                        // resolve({ status: 200, data: data, success: true })
                        resolve(data)
                    }
                })
            } else {
                resolve({})
            }
        })
    }
}

const convertToJson = async (data) => {
    return new Promise(async (resolve) => {
        try {
            let jsonContent = JSON.stringify(data)
            let buffer = Buffer.from(jsonContent)
            resolve(buffer)
        } catch (error) {
            console.log(error)
            resolve(error)
        }
    })
}

const vpn = {
    describeVpnConnections: (ec2, arn = null) => {
        console.log('CCCCCC>>>', arn)
        // const data = []
        let data = {}
        return new Promise(resolve => {
            ec2.describeVpnConnections({ VpnConnectionIds: [ arn.split('/')[1] ] }, async (err, result) => {
                console.log('--->>> EC ')
                if (err) {
                    // console.log(err, err.stack)
                    // resolve({ status: 400, err: err, success: false })
                    resolve({})
                } else {
                    console.log('eee >>', result)
                    data = {
                        'Name': result.VpnConnections[0].Tags[0].Value,
                        'VPN ID': result.VpnConnections[0].VpnConnectionId,
                        'Status': result.VpnConnections[0].State
                    }
                    // data.push({
                    //     'Name': result.VpnConnections[0].Tags[0].Value,
                    //     'VPN ID': result.VpnConnections[0].VpnConnectionId,
                    //     'Status': result.VpnConnections[0].State
                    // })
                    //
                    // const jsonBuffer = await convertToJson(data[0])
                    //
                    // const params = {
                    //     Body: jsonBuffer,
                    //     Bucket: "sentinel-userfile",
                    //     Key: `Inventory/${ accountData.accountId }/${ accountData.accountName }/${ currentYear }/${ currentMonth }/VPN/${ arn.split('/')[1] }_${ currentYear }_${ currentMonth }.json`,
                    //     ACL: 'public-read'
                    // }
                    // await putObject(params)

                    // resolve({ status: 200, data: data, success: true })
                    resolve(data)
                }
            })
        })
    }
}

const cloudfront = {
    getDistribution: (cloudfront, arn = null) => {
        // const data = []
        let data = {}
        return new Promise(resolve => {
            cloudfront.getDistribution({ Id: arn.split('/')[1] }, async (err, result) => {
                if (err) {
                    // console.log(err, err.stack)
                    resolve({ status: 400, err: err, success: false })
                } else {
                    if (result.Distribution.DistributionConfig.ViewerCertificate.Certificate) {
                        const domainName = result.Distribution.DistributionConfig.Aliases.Items[0]
                        const certificateId = result.Distribution.DistributionConfig.ViewerCertificate.Certificate.split('/')[1]
                        data = {
                            'CloudFront ID': arn.split('/')[1],
                            'CloudFront Domain Name': result.Distribution.DomainName,
                            'Domain Name': result.Distribution.DistributionConfig.Aliases.Items[0],
                            'SSL': `${ domainName } (${ certificateId })`,
                            'Status': result.Distribution.Status
                        }
                        // data.push({
                        //     'CloudFront ID': arn.split('/')[1],
                        //     'CloudFront Domain Name': result.Distribution.DomainName,
                        //     'Domain Name': result.Distribution.DistributionConfig.Aliases.Items[0],
                        //     'SSL': `${ domainName } (${ certificateId })`,
                        //     'Status': result.Distribution.Status
                        // })
                        // data.cloudfront = {
                        //     'CloudFront ID': arn.split('/')[1],
                        //     'CloudFront Domain Name': result.Distribution.DomainName,
                        //     'Domain Name': result.Distribution.DistributionConfig.Aliases.Items[0],
                        //     'SSL': `${domainName} (${certificateId})`,
                        //     'Status': result.Distribution.Status
                        // }
                    } else {
                        // data.push({
                        //     'CloudFront ID': arn.split('/')[1],
                        //     'CloudFront Domain Name': result.Distribution.DomainName,
                        //     'Domain Name': result.Distribution.DistributionConfig.Aliases.Items[0] || '-',
                        //     'SSL': 'Default CloudFront Certificate (*.cloudfront.net)',
                        //     'Status': result.Distribution.Status
                        // })
                        data = {
                            'CloudFront ID': arn.split('/')[1],
                            'CloudFront Domain Name': result.Distribution.DomainName,
                            'Domain Name': result.Distribution.DistributionConfig.Aliases.Items[0] || '-',
                            'SSL': 'Default CloudFront Certificate (*.cloudfront.net)',
                            'Status': result.Distribution.Status
                        }
                    }

                    // const jsonBuffer = await convertToJson(data[0])
                    //
                    // const params = {
                    //     Body: jsonBuffer,
                    //     Bucket: "sentinel-userfile",
                    //     Key: `Inventory/${ accountData.accountId }/${ accountData.accountName }/${ currentYear }/${ currentMonth }/CloudFront/${ arn.split('/')[1] }_${ currentYear }_${ currentMonth }.json`,
                    //     ACL: 'public-read'
                    // }
                    //
                    // await putObject(params)
                    resolve({ status: 200, data: data, success: true })
                }
            })
        })
    }
}

const s3 = {
    listObjectsV2: (s3, arn = null) => {
        let data = {}
        return new Promise(resolve => {
            console.log('Bucket: ', arn.split(':')[5])
            s3.listObjectsV2({ Bucket: arn.split(':')[5] }, async (err, result) => {
                if (err) {
                    // console.log(err, err.stack)
                    resolve({ status: 400, err: err, success: false })
                } else {
                    let sumSize = 0
                    for (let i in result.Contents) {
                        sumSize += result.Contents[i].Size
                    }
                    data = {
                        'Bucket Name': result.Name,
                        'Bucket Size': sumSize,
                    }
                    resolve(data)
                    // data.push({
                    //     'Bucket Name': result.Name,
                    //     'Bucket Size': sumSize,
                    //     // KeyCount: dataS3.KeyCount
                    // })
                    // s3Data.push({ ...describe })

                    // const jsonBuffer = await convertToJson(data[0])
                    //
                    // const params = {
                    //     Body: jsonBuffer,
                    //     Bucket: "sentinel-userfile",
                    //     Key: `Inventory/${ accountData.accountId }/${ accountData.accountName }/${ currentYear }/${ currentMonth }/S3/${ arn.split(':')[5] }_${ currentYear }_${ currentMonth }.json`,
                    //     ACL: 'public-read'
                    // }
                    //
                    // await putObject(params)
                    // resolve({ status: 200, data: data, success: true })
                }
            })
        })
    },
    getObject: (s3, params = {}) => {
        return new Promise(resolve => {
            s3.getObject(params, async function (err, data) {
                if (err) {
                    console.log('err', err)
                    resolve({ status: 400, err: err, success: false })
                } else {
                    resolve(data.Body.toString('utf8'))
                    // resolve({ status: 200, data: data.Body.toString('utf8'), success: true })
                }
            })
        })
    }
}

const rds = {
    describeDBInstances: (rds, arn = null, accountData = null) => {
        let data = {}
        return new Promise(resolve => {
            rds.describeDBInstances({ DBInstanceIdentifier: arn.split(':')[6] }, async (err, result) => {
                if (err) {
                    // console.log(err, err.stack)
                    resolve({ status: 400, err: err, success: false })
                } else {
                    data = {
                        'Account Name': accountData.accountName,
                        'Resource Name': result.DBInstances[0].DBName,
                        'Engine': result.DBInstances[0].Engine,
                        'DNS Name': result.DBInstances[0].Endpoint.Address,
                        'Instance Type': result.DBInstances[0].DBInstanceClass,
                        'Status': result.DBInstances[0].DBInstanceStatus
                    }
                    resolve(data)
                    // data.push({
                    //     'Account Name': accountData.accountName,
                    //     'Resource Name': result.DBInstances[0].DBName,
                    //     'Engine': result.DBInstances[0].Engine,
                    //     'DNS Name': result.DBInstances[0].Endpoint.Address,
                    //     'Instance Type': result.DBInstances[0].DBInstanceClass,
                    //     'Status': result.DBInstances[0].DBInstanceStatus
                    // })
                    //
                    // const jsonBuffer = await convertToJson(data[0])
                    //
                    // const params = {
                    //     Body: jsonBuffer,
                    //     Bucket: "sentinel-userfile",
                    //     Key: `Inventory/${ accountData.accountId }/${ accountData.accountName }/${ currentYear }/${ currentMonth }/RDS/${ arn.split(':')[6] }_${ currentYear }_${ currentMonth }.json`,
                    //     ACL: 'public-read'
                    // }
                    //
                    // await putObject(params)
                    // resolve({ status: 200, data: data, success: true })
                }
            })
        })
    }
}

const elasticache = {
    describeReplicationGroups: (elasticache, arn = null) => {
        let data = {}
        return new Promise(resolve => {
            const replicationGroupId = (processText(arn.split(':')[6]))[0][0]
            elasticache.describeReplicationGroups({ ReplicationGroupId: replicationGroupId }, async (err, result) => {
                if (err) {
                    // console.log(err, err.stack)
                    resolve({ status: 400, err: err, success: false })
                } else {
                    data = {
                        'Name': `${ result.ReplicationGroups[0].ReplicationGroupId } (redis)`,
                        'Engine': 'redis',
                        'Nodes': `${ result.ReplicationGroups[0].MemberClusters.length } Node`,
                        'Node Type': result.ReplicationGroups[0].CacheNodeType,
                        'Status': result.ReplicationGroups[0].Status,
                    }
                    resolve(data)
                    // data.push({
                    //     'Name': `${ result.ReplicationGroups[0].ReplicationGroupId } (redis)`,
                    //     'Engine': 'redis',
                    //     'Nodes': `${ result.ReplicationGroups[0].MemberClusters.length } Node`,
                    //     'Node Type': result.ReplicationGroups[0].CacheNodeType,
                    //     'Status': result.ReplicationGroups[0].Status,
                    // })
                    // // console.log('elastiCacheData', data)
                    // const jsonBuffer = await convertToJson(data[0])
                    //
                    // const params = {
                    //     Body: jsonBuffer,
                    //     Bucket: "sentinel-userfile",
                    //     Key: `Inventory/${ accountData.accountId }/${ accountData.accountName }/${ currentYear }/${ currentMonth }/ElastiCache/${ replicationGroupId }_${ currentYear }_${ currentMonth }.json`,
                    //     ACL: 'public-read'
                    // }
                    //
                    // await putObject(params)
                    // resolve({ status: 200, data: data, success: true })
                }
            })
        })
    }
}

function processText(inputText) {
    try {
        const output = []
        const json = inputText.split(' ')
        json.forEach(function (item) {
            output.push(item.replace(/\'/g, '').split(/(-\d+)/).filter(Boolean))
        })
        return output
    } catch (err) {
        console.log(err)
        return err
    }
}

const elasticsearch = {
    describeElasticsearchDomains: (elasticsearch, arn = null) => {
        let data = {}
        return new Promise(resolve => {
            elasticsearch.describeElasticsearchDomains({ DomainNames: [ arn.split('/')[1] ] }, async (err, result) => {
                if (err) {
                    // console.log(err, err.stack);
                    resolve({ status: 400, err: err, success: false })
                } else {
                    data = {
                        'Name': result.DomainStatusList[0].DomainName,
                        'VPC Enpoint': result.DomainStatusList[0].Endpoints.vpc,
                        'Instance Type': result.DomainStatusList[0].ElasticsearchClusterConfig.InstanceType,
                        'Status': (result.DomainStatusList[0].Processing == false) ? 'Active' : 'Processing'
                    }
                    resolve(data)
                    // data.push({
                    //     'Name': result.DomainStatusList[0].DomainName,
                    //     'VPC Enpoint': result.DomainStatusList[0].Endpoints.vpc,
                    //     'Instance Type': result.DomainStatusList[0].ElasticsearchClusterConfig.InstanceType,
                    //     'Status': (result.DomainStatusList[0].Processing == false) ? 'Active' : 'Processing'
                    // })
                    // const jsonBuffer = await convertToJson(data[0])
                    //
                    // const params = {
                    //     Body: jsonBuffer,
                    //     Bucket: "sentinel-userfile",
                    //     Key: `Inventory/${ accountData.accountId }/${ accountData.accountName }/${ currentYear }/${ currentMonth }/ES/${ arn.split('/')[1] }_${ currentYear }_${ currentMonth }.json`,
                    //     ACL: 'public-read'
                    // }
                    //
                    // await putObject(params)
                    // resolve({ status: 200, data: data, success: true })
                }
            })
        })
    }
}

const elasticloadbalancing = {
    describeLoadBalancers: (elb = null, elbv2 = null, arn = null, accountData = null) => {
        // const data = []
        let data = {}
        return new Promise(resolve => {
            if (arn.includes("/app/") || arn.includes("/net/")) {
                elbv2.describeLoadBalancers({ LoadBalancerArns: [ arn ] }, async (err, result) => {
                    if (err) {
                        // console.log(err, err.stack)
                        resolve({ status: 400, err: err, success: false })
                    } else {
                        console.log('dataLoadBalancersa', result)
                        data = {
                            'Account Name': accountData.accountName,
                            'Resource Name': result.LoadBalancers[0].LoadBalancerName,
                            'DNS Name': result.LoadBalancers[0].DNSName,
                            'Type': (result.LoadBalancers[0].Type == 'application') ? 'Application' : 'Network'
                        }
                        resolve(data)
                        // data.push({
                        //     'Account Name': accountData.accountName,
                        //     'Resource Name': result.LoadBalancers[0].LoadBalancerName,
                        //     'DNS Name': result.LoadBalancers[0].DNSName,
                        //     'Type': (result.LoadBalancers[0].Type == 'application') ? 'Application' : 'Network'
                        // })
                        // // console.log('elbData', elbData)
                        // const jsonBuffer = await convertToJson(data[0])
                        //
                        // const params = {
                        //     Body: jsonBuffer,
                        //     Bucket: "sentinel-userfile",
                        //     Key: `Inventory/${ accountData.accountId }/${ accountData.accountName }/${ currentYear }/${ currentMonth }/${ (result.LoadBalancers[0].Type == 'application') ? 'ALB' : 'NLB' }/${ arn.split('/')[2] }_${ currentYear }_${ currentMonth }.json`,
                        //     ACL: 'public-read'
                        // }
                        //
                        // await putObject(params)
                        // resolve({ status: 200, data: data, success: true })
                    }
                })
            } else {
                elb.describeLoadBalancers({ LoadBalancerNames: [ arn.split('/')[1] ] }, async (err, result) => {
                    if (err) {
                        // console.log(err, err.stack)
                        resolve({ status: 400, err: err, success: false })
                    } else {
                        data = {
                            'Account Name': accountData.accountName,
                            'Resource Name': result.LoadBalancerDescriptions[0].LoadBalancerName,
                            'DNS Name': result.LoadBalancerDescriptions[0].DNSName,
                            'Type': 'X',
                        }
                        resolve(data)
                        // console.log('dataLoadBalancers', result)
                        // data.push({
                        //     'Account Name': accountData.accountName,
                        //     'Resource Name': result.LoadBalancerDescriptions[0].LoadBalancerName,
                        //     'DNS Name': result.LoadBalancerDescriptions[0].DNSName,
                        //     'Type': 'X',
                        // })
                        // const jsonBuffer = await convertToJson(data[0])
                        //
                        // const params = {
                        //     Body: jsonBuffer,
                        //     Bucket: "sentinel-userfile",
                        //     Key: `Inventory/${ accountData.accountId }/${ accountData.accountName }/${ currentYear }/${ currentMonth }/ELB/${ arn.split('/')[1] }_${ currentYear }_${ currentMonth }.json`,
                        //     ACL: 'public-read'
                        // }
                        //
                        // await putObject(params)
                        // resolve({ status: 200, data: data, success: true })
                    }
                })
            }
        })
    }
}

const ecs = {
    listTasks: (ecs, arn = null) => {
        const taskArnArray = []
        return new Promise(resolve => {
            console.log()
            ecs.listTasks({ cluster: arn.split('/')[1] }, function (err, result) {
                if (err) {
                    // console.log(err, err.stack);
                    resolve({ status: 400, err: err, success: false })
                } else {
                    for (let i in result.taskArns) {
                        taskArnArray.push(result.taskArns[i].split('/')[1])
                    }
                    resolve({ status: 200, data: taskArnArray, success: true })
                }
            })
        })
    },

    describeTasks: (ecs, arn = null, taskArray = null) => {
        return new Promise(resolve => {
            if (taskArray.length > 0) {
                ecs.describeTasks({ tasks: taskArray, cluster: arn.split('/')[1] }, async (err, result) => {
                    if (err) {

                        // console.log(err, err.stack);
                        resolve({ status: 400, err: err, success: false })
                    } else {
                        const promiseData = []
                        for (let i in result.tasks) {
                            promiseData.push({
                                'Cluster': result.tasks[i].clusterArn.split('/')[1],
                                'Service Name': result.tasks[i].group.split(':')[1],
                                'Launch Type': result.tasks[i].launchType,
                                'Task': result.tasks[i].taskArn.split('/')[1],
                            })
                        }
                        resolve(promiseData)

                        // const allResources = await Promise.all(promiseData)
                        // console.log(allResources)

                        // const jsonBuffer = await convertToJson(promiseData[0])
                        //
                        // const params = {
                        //     Body: jsonBuffer,
                        //     Bucket: "sentinel-userfile",
                        //     Key: `Inventory/${ accountData.accountId }/${ accountData.accountName }/${ currentYear }/${ currentMonth }/ECS/${ result.tasks[i].taskArn.split('/')[1] }_${ currentYear }_${ currentMonth }.json`,
                        //     ACL: 'public-read'
                        // }
                        //
                        // await putObject(params)
                        // resolve({ status: 200, data: allResources, success: true })
                    }
                })
            }
        })
    }
}

const dynamoDB = {
    describeTable: (_dynamoDB = null, arn = null) => {
        // let data = {}
        const table = arn.split('/')[1]
        console.log('describeTable ', table)
        const params = {
            TableName: table
        }
        return params
        // return new Promise(resolve => {
        //     // dynamoDB.describeTable(params, (err, data) => {
        //         dynamoDB.listTables(params, (err, data) => {
        //         if (err) {
        //             console.log('ERRoR Dynamo DB ==========> : ', err)
        //             resolve(err)
        //         } else {
        //             console.log('Dynomo DATA: ', data)
        //             resolve(data)
        //         }
        //     })
        // })
    }
}

const lambda = {
    describeLambda: (_lambda, lambdaArn) => {
        return new Promise(resolve => {
            const functionName = lambdaArn.split(':')[6]
            resolve({ functionName: functionName })
            // const cutName = functionName.split('-')
            // const name = `${cutName[0]}-${1}-${2}-${3}`
            // const params = {
            //     FunctionName: lambdaArn,
            //     Name: name
            //     // Arn: lambdaArn
            // }
            // console.log('Params Lambda => ', params)
            // lambda.getAlias(params, (err, data) => {
            //     if (err) {
            //         console.log('Error Lambda :', err)
            //         resolve(err)
            //     } else {
            //         console.log('DATA: Lambda :', data)
            //         resolve(data)
            //     }
            // })
            // lambda.getAccountSettings(params, (err, data) => {
            //     if (err) {
            //         console.log('Error Lambda :', err)
            //         resolve(err)
            //     } else {
            //         console.log('DATA: Lambda :', data)
            //         resolve(data)
            //     }
            // })
        })

    }
}

const apiGateway = {
    describeApiGateway: (apiGetway, apiGatewayArn) => {
        return new Promise(resolve => {
            const apiId = apiGatewayArn.split(':')[5]
            console.log('API ID: ', apiId)
            const param = {
                restApiId: apiId,
                // limit: '20',
                // position: '/'
            }
            apiGetway.getDeployments(param, (err, data) => {
                if (err) {
                    console.log('Error: ', err)
                    resolve(err)
                } else {
                    console.log('DATA Api Gateway: ', data)
                    resolve(data)
                }
            })
        })
    }
}

const cloudwatch = {
    describeCloudwatch: (_cloudwatch, cloudwatchArn) => {
        return new Promise(resolve => {
            const cloudWatchArnCut = cloudwatchArn.split(':')[6]
            const cloudWatchCutName = cloudWatchArnCut.split('/')
            let cloudWatchName = cloudWatchCutName[0]
            if (cloudWatchCutName[1]) {
                cloudWatchName = cloudWatchCutName[1]
            }
            resolve({ alarmName: cloudWatchName })
            // const params = {
            //     ActionPrefix: cloudwatchArn,
            //     AlarmNamePrefix: 'TargetTracking-table',
            //     AlarmNames: [
            //         'Name',
            //         'State'
            //         /* more items */
            //     ],
            //     AlarmTypes: [
            //         'CompositeAlarm'
            //         // | MetricAlarm,
            //         /* more items */
            //     ],
            //     ChildrenOfAlarmName: 'STRING_VALUE',
            //     MaxRecords: '2',
            //     NextToken: 'STRING_VALUE',
            //     ParentsOfAlarmName: 'STRING_VALUE',
            //     StateValue: 'OK'
            // }
            // cloudwatch.describeAlarms(params, (err, data) => {
            //     if (err) {
            //         console.log('Error: ', err)
            //         resolve(err)
            //     } else {
            //         console.log('DATA CloudWatch: ', data)
            //         resolve(data)
            //     }
            // })
        })
    }
}

const cloudFormation = {
    describeCloudFormation: (cloudformation, _cloudformationArn) => {
        return new Promise(resolve => {
            const params = {
                // LogicalResourceId: null, /* required */
                // StackName: cloudformationArn /* required */
                NextToken: null,
                StackStatusFilter: [
                    'CREATE_IN_PROGRESS', 'CREATE_FAILED', 'CREATE_COMPLETE', 'ROLLBACK_IN_PROGRESS',
                    'ROLLBACK_FAILED', 'ROLLBACK_COMPLETE'
                ]
            }
            cloudformation.listStacks(params, (err, data) => {
                if (err) {
                    console.log(err, err.stack)
                    resolve(err)
                } else {
                    console.log(data)
                    resolve(data)
                }          // successful response
            })
            // const params = {
            //     LogicalResourceId: cloudformationArn.split('/')[2], /* required */
            //     StackName: cloudformationArn /* required */
            // }
            // cloudformation.describeStackResource(params, (err, data) => {
            //     if (err) {
            //         console.log(err, err.stack)
            //         resolve(err)
            //     } else {
            //         console.log(data)
            //         resolve(data)
            //     }          // successful response
            // })
            // const params = {
            //     StackInstanceAccount: 'd01ac9c0-20c7-11ec-ba1b-0a0de2cc44c0', /* required */
            //     StackInstanceRegion: 'ap-southeast-1', /* required */
            //     StackSetName: 'serverless-mvrp-2-dev', /* required */
            //     // CallAs: SELF | DELEGATED_ADMIN
            // }
            // cloudformation.describeStackInstance(params, function(err, data) {
            //     if (err) {
            //         console.log(err, err.stack)
            //         resolve(err)
            //     } else {
            //         console.log(data)
            //         resolve(data)
            //     }
            // })
        })
    }
}

// function childAccount(accountId) {
//     return new Promise(async (resolve) => {
//         try {
//             let dynamodb = new AWS.DynamoDB.DocumentClient({ region: "ap-southeast-1" })
//             let childAccount = await controller.dynamodoc.get(dynamodb, {
//                 TableName: db.CHILD_ACCOUNTS,
//                 Key: { childId: `child-${accountId}-child` }
//             })
//
//             resolve(childAccount)
//         }
//         catch (error) {
//             console.log(error);
//             resolve(error)
//         }
//     });
// }

export {
    resourcegroupstaggingapi,
    ec2,
    autoscaling,
    convertToJson,
    vpn,
    cloudfront,
    s3,
    rds,
    elasticache,
    elasticsearch,
    elasticloadbalancing,
    ecs,
    dynamoDB,
    lambda,
    apiGateway,
    cloudwatch,
    cloudFormation,
}
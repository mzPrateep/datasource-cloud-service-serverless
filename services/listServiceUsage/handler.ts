import { Callback, Context } from 'aws-lambda'
import Error from '../../controller/Error'
// import * as moment from 'moment-timezone'
// import * as STS from '../sts/assumeRole'
// import SwitchRolerController from '../../controller/SwitchRole'
import { regions } from '../../configs/regions'
import * as AWS from 'aws-sdk'
import * as describeservicesController from '../../controller/ResourceGroupsTaggingapi'
import SwitchRolerController from '../../controller/SwitchRole'
import Success from '../../controller/Success'
import { assumeRole2 } from '../sts/assumeRole2'
// import GetTokenController from '../../controller/GetToken'
// import * as CostExplorer from '../costexplorer'

const listServiceUsage = async (event?: any, _context?: Context, callback?: Callback) => {
    try {
        //  "query": {
        //    "accountId": "245747666211",
        //    "iamRole": "ppa-master-role"
        //  }
        console.log('EVENT : ', event)
        const accountId = event.body.accountId
        const iamRole = event.body.iamRole
        const masterIamRole = event.body.masterIamRole
        const masterId = event.body.masterId
        const name = event.body.name

        let promiseServices = []
        let serviceKey = {}

        let params = {
            // RoleArn: `arn:aws:iam::${ event.query.masterId }:role/${ event.query.iamRole }`,
            RoleArn: `arn:aws:iam::${ masterId }:role/${ masterIamRole }`,
            RoleSessionName: `ListServiceByAccount`,
            // RoleArn: 'arn:aws:iam::245747666211:role/ppa-master-role',
            // RoleSessionName: 'MasterAccountCreate'
        }
        let key: any = await new SwitchRolerController().SwitchRole(params)
        // console.log('key1 :', key)
        if (!key.ResponseMetadata) {
            return key
        }
        // AWS.config.update()

        let paramsSwitchRole2 = {
            RoleArn: `arn:aws:iam::${ accountId }:role/${ iamRole }`,
            RoleSessionName: `ListServiceByAccount`,
            // RoleArn: 'arn:aws:iam::245747666211:role/ppa-master-role',
            // RoleSessionName: 'MasterAccountCreate'
        }

        let key3: any = {}

        // let descrbeAll = []
        for (let i in regions) {
            let region = regions[i].region
            // console.log('Region: ', region)
            let key2: any = await assumeRole2(paramsSwitchRole2, key.Credentials, region)
            if (!key2.ResponseMetadata) {
                return key2
            }
            key3 = key2
            // console.log('Key2 : ', key2)

            const resourcegroupsSdk = await new AWS.ResourceGroupsTaggingAPI({
                region,
                accessKeyId: key2.Credentials.AccessKeyId,
                secretAccessKey: key2.Credentials.SecretAccessKey,
                sessionToken: key2.Credentials.SessionToken,
            })
            // console.log('RE ', resourcegroupsSdk)
            // const describeservicesData = describeservicesController
            //     .resourcegroupstaggingapi
            //     .getResources(resourcegroupsSdk, {}, region)

            promiseServices.push(describeservicesController
                .resourcegroupstaggingapi
                .getResources(resourcegroupsSdk, {}, region))


            // console.log('Describe/ :', describe)
            // return describe
            // return describe
            // promiseServices.push(
            //     describeservicesController
            //         .resourcegroupstaggingapi
            //         .getResources(resourcegroupsSdk, {}, region))
        }
        // return descrbeAll

        let allResources = await Promise.all(promiseServices)
        allResources = allResources.filter(o => o.success === true)

        for (let i in allResources) {
            if (typeof allResources[i].data !== "undefined") {
                if (allResources[i].data.ResourceTagMappingList.length > 0) {
                    for (let j in allResources[i].data.ResourceTagMappingList) {
                        let serviceName = allResources[i].data.ResourceTagMappingList[j].ResourceARN.split(':')[2]
                        if (!(serviceName in serviceKey)) {
                            serviceKey[serviceName] = []
                            serviceKey[serviceName].push(allResources[i].data.ResourceTagMappingList[j].ResourceARN)
                        } else {
                            serviceKey[serviceName].push(allResources[i].data.ResourceTagMappingList[j].ResourceARN)
                        }
                    }

                }
            }
        }

        let data = []
        let accKey = Object.keys(serviceKey)
        for (let item in accKey) {
            let keyName = accKey[item]
            data.push({
                name: keyName,
                arnArray: serviceKey[keyName]
            })

        }

        for (let l in data) {
            const serviceName = data[l].name
            const services = data[l]
            let describeAll = []
            for (let i in services.arnArray) {
                console.log('KEY 3: ', key3)
                console.log('region: ', 'ap-southeast-1', ' accountId: ', accountId, ' name: ', name)
                // const describe = await describeServices(serviceName, key3, accountId, name, 'ap-southeast-1', services.arnArray[i])
                // descrbeAll.push(describe)
                describeAll.push(describeServices(serviceName, key3, accountId, name, 'ap-southeast-1', services.arnArray[i]))

            }
            let allResourcesDescibe = await Promise.all(describeAll)
            console.log('===============>>>>>>>>>>>>> DE: ', allResourcesDescibe)
            data[l].describe = allResourcesDescibe
            describeAll = []

            // let key2: any = await assumeRole2(paramsSwitchRole2, key.Credentials, 'ap-southeast-1')
            // console.log('KEY 3: ', key3)
            // console.log('region: ', 'ap-southeast-1', ' accountId: ', accountId, ' name: ', name)
            // const describe = await describeServices(serviceName, key3, accountId, name, 'ap-southeast-1')
            // descrbeAll.push(describe)

            // for (let i in regions) {
            //     const region = regions[i].region
            //     let key2: any = await assumeRole2(paramsSwitchRole2, key.Credentials, region)
            //     console.log('region: ', region, ' accountId: ', accountId, ' name: ', name)
            //     const describe = await describeServices(serviceName, key2, accountId, name, region)
            //     descrbeAll.push(describe)
            // }
            // console.log('===============>>>>>>>>>>>>> DE: ', describe)
            // data[l].describe = describe

        }
        console.log('arnarray', data)


        //
        // response.status = 200
        // response.success = true
        // response.message = 'Ok'
        // response.data = data
        // return new Success('Successful.')
        return new Success(data, 'Successful.')


    } catch (error) {
        return callback(JSON.stringify(
            new Error(
                400,
                JSON.stringify(error.message),
                'List Service Name'
            )
        ))
    }
}

const describeServices = async (serviceName, key, accountId, name, region, serviceArn) => {
    return new Promise(async (resolve) => {
        // const promiseServices = []
        // const stsKey = {
        //     region: region,
        //     accessKeyId: key.Credentials.AccessKeyId,
        //     secretAccessKey: key.Credentials.SecretAccessKey,
        //     sessionToken: key.Credentials.SessionToken
        // }
        // let paramsGetToken = {
        //     region: 'ap-southeast-1',
        //     accessKeyId: 'AKIAV7RJ7H37T57V4ZV6',
        //     secretAccessKey: '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',
        //     sessionToken: 'getDescribeService'
        // }
        // AWS.config.update(paramsGetToken)
        // console.log('AC2 :', AWS.config.accessKeyId)
        // // let getToken = await new GetTokenController().GetToken(paramsGetToken)
        // // console.log('Get Token =====>>> ', getToken)
        //
        // let params = {
        //     // RoleArn: `arn:aws:iam::245747666211:role/ppa-master-role`,
        //     RoleArn: 'arn:aws:iam::515836298674:role/ppa-linked-role',
        //     RoleSessionName: `getDescribeService`,
        //     // RoleArn: 'arn:aws:iam::245747666211:role/ppa-master-role',
        //     // RoleSessionName: 'MasterAccountCreate'
        // }
        // let key: any = await new SwitchRolerController().SwitchRole(params)
        const stsKey = {
            region: region,
            accessKeyId: key.Credentials.AccessKeyId,
            secretAccessKey: key.Credentials.SecretAccessKey,
            sessionToken: key.Credentials.SessionToken
        }
        const accountData = {
            accountId: accountId,
            accountName: name
        }
        // const ec2 = new AWS.EC2(stsKey)
        // await ec2.describeInstances({InstanceIds: ['i-0065adaf0d1d80e53']}, async (err, result) => {
        //     if (err) {
        //         console.log(err, err.stack)
        //         resolve({status: 400, err: err, success: false})
        //     } else {
        //         console.log('RE >>>>> ', result)
        //     }
        // })
        //         const promiseEc2: any = await describeservicesController
        //             .ec2
        //             .describeInstances(ec2)
        //         console.log('promiseEc2 =====> ', promiseEc2)
        //         const allResources = await Promise.all(promiseEc2)
        //         console.log('DECRIBE EC2 :', allResources)
        // console.log('STS KEY :>>> ', stsKey)

        // const arn = key.AssumedRoleUser.Arn

        // const arnSplit = key.AssumedRoleUser.Arn.split('/')
        // const arn = `${ arnSplit[0] }/${ arnSplit[1] }`
        console.log('AssumedRoleUserARN : ', serviceArn)
        console.log('Service Name : ', serviceName)
        let promiseServices = []
        switch (serviceName) {
            case 'ec2':
                const ec2 = new AWS.EC2(stsKey)
                console.log('EC2 STS: ', ec2)
                const promiseEc2: any = await describeservicesController
                    .ec2
                    .describeInstances(ec2, serviceArn, accountData)
                console.log('RES EC2 =========> ', promiseEc2)
                // console.log('promiseEc2 =====> ', promiseEc2)
                // const allResources = await Promise.all(promiseEc2)
                // console.log('DECRIBE EC2 :', allResources)
                resolve(promiseEc2)
                break

            case 'autoscaling':
                console.log('Auto Scaling >>>> ', region)
                let autoscaling = new AWS.AutoScaling(stsKey)
                console.log('Auto Scaling===== >>>> ', autoscaling)
                let autoRes: any = await describeservicesController
                    .autoscaling
                    .describeAutoScalingInstances(autoscaling, serviceArn)

                if (autoRes.success === true) {
                    promiseServices.push(autoRes)
                    let resourcesAutoScalingInstances = await Promise.all(promiseServices)
                    promiseServices = []
                    console.log('AUTO RES : ', autoRes)

                    const desAuto = await describeservicesController
                        .autoscaling
                        .describeAutoScalingGroups(autoscaling, resourcesAutoScalingInstances[0].data, accountData)

                    // promiseServices.push(desAuto)
                    // console.log('DES AUTO >>>> ', promiseServices)
                    // let resourcesAutoScalingGroups = await Promise.all(promiseServices)

                    resolve(desAuto)
                }
                // console.log('describe', resourcesAutoScalingGroups)
                break
            case 'vpn':
                const ec2Vpn: any = new AWS.EC2(stsKey)
                console.log('EEEEEE >>>>> ', ec2Vpn)
                const desVPN = await describeservicesController
                    .vpn
                    .describeVpnConnections(ec2Vpn, serviceArn)
                promiseServices.push(desVPN)

                const allResourcesVpn = await Promise.all(promiseServices)
                console.log('describe', allResourcesVpn)
                resolve(allResourcesVpn)
                break

            case 'cloudfront':
                const cloudfront = new AWS.CloudFront(stsKey)
                promiseServices.push(
                    describeservicesController
                        .cloudfront
                        .getDistribution(cloudfront, serviceArn))

                const allResourcesCloudFront = await Promise.all(promiseServices)
                // console.log('describe', allResources)
                resolve(allResourcesCloudFront)
                break

            case 's3':
                const s3 = new AWS.S3(stsKey)
                const resS3 = describeservicesController.s3.listObjectsV2(s3, serviceArn)
                // promiseServices.push(
                //     describeservicesController
                //         .s3
                //         .listObjectsV2(s3, serviceArn, accountData))

                // const allResourcesS3 = await Promise.all(promiseServices)
                // console.log('describe', promiseServices)
                resolve(resS3)
                break

            case 'rds':
                const rds = new AWS.RDS(stsKey)
                promiseServices.push(
                    describeservicesController
                        .rds
                        .describeDBInstances(rds, serviceArn, accountData))

                const allResourcesRDS = await Promise.all(promiseServices)
                console.log('describe', allResourcesRDS)
                resolve(allResourcesRDS)
                break

            case 'elasticache':
                const elasticache = new AWS.ElastiCache(stsKey)
                promiseServices.push(
                    describeservicesController
                        .elasticache
                        .describeReplicationGroups(elasticache, serviceArn))

                const allResourcesElc = await Promise.all(promiseServices)
                console.log('describe', allResourcesElc)
                resolve(allResourcesElc)
                break

            case 'elasticsearch':
                const elasticsearch = new AWS.ES(stsKey)
                promiseServices.push(
                    describeservicesController
                        .elasticsearch
                        .describeElasticsearchDomains(elasticsearch, serviceArn))

                const allResourcesEls = await Promise.all(promiseServices)
                console.log('describe', allResourcesEls)
                resolve(allResourcesEls)
                break

            case 'elasticloadbalancing':
                const elb = new AWS.ELB(stsKey)
                const elbv2 = new AWS.ELBv2(stsKey)
                promiseServices.push(
                    describeservicesController
                        .elasticloadbalancing
                        .describeLoadBalancers(elb, elbv2, serviceArn, accountData))

                const allResourcesElb = await Promise.all(promiseServices)
                console.log('describe', allResourcesElb)
                resolve(allResourcesElb)
                break

            case 'ecs':
                const ecs = new AWS.ECS(stsKey)
                promiseServices.push(
                    describeservicesController
                        .ecs
                        .listTasks(ecs, serviceArn))

                const resourcesListTasks = await Promise.all(promiseServices)
                promiseServices = []

                promiseServices.push(
                    describeservicesController
                        .ecs
                        .describeTasks(ecs, serviceArn, resourcesListTasks[0].data))

                const resourcesTasks = await Promise.all(promiseServices)
                // console.log('describe', resourcesTasks)
                resolve(resourcesTasks)
                break

            case 'dynamodb':
                AWS.config.apiVersions = {
                    dynamodb: '2012-08-10',
                }
                const dynamoDB = new AWS.DynamoDB
                const describeTable = await describeservicesController.dynamoDB.describeTable(dynamoDB, serviceArn)
                resolve(describeTable)
                break

            case 'lambda':
                const lambda = new AWS.Lambda({apiVersion: '2015-03-31'})
                const describeLambda = await describeservicesController.lambda.describeLambda(lambda, serviceArn)
                resolve(describeLambda)
                break

            // case 'apigateway':
            //     const apiGateway = new AWS.APIGateway({apiVersion: '2015-07-09'})
            //     const describeApiGetaway = await describeservicesController.apiGateway.describeApiGateway(apiGateway, serviceArn)
            //     resolve(describeApiGetaway)
            //     break

            case 'cloudwatch':
                const cloudwatch = new AWS.CloudWatch({apiVersion: '2010-08-01'})
                const describeCloudWatch = await describeservicesController.cloudwatch.describeCloudwatch(cloudwatch, serviceArn)
                resolve(describeCloudWatch)
                break

            // case 'cloudformation':
            //     const cloudFormation = new AWS.CloudFormation({apiVersion: '2010-05-15'})
            //     const describeCloudFormation = await describeservicesController.cloudFormation.describeCloudFormation(cloudFormation, serviceArn)
            //     resolve(describeCloudFormation)
            //     break

            default :
                console.log(`ServiceName: ${serviceName} is not function`)
                resolve(`ServiceName: ${serviceName} is not function`)
                break

        }
        // resolve(promiseServices)

    })
}

export const main = listServiceUsage

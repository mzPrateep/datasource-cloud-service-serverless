import apiResponse from '../../configs/apiResponse'

export default {
    handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
    events: [
        {
            http: {
                method: 'post',
                path: 'getAutoScalingGroupNames',
                integration: 'lambda',
                cors: {
                    origin: "*",
                },
                request: {},
                response: apiResponse,

            }
        }
    ],
    // iamRoleStatements: [
    //     {
    //         Effect: "Allow",
    //         Action: [
    //             "athena:StartQueryExecution"
    //         ],
    //         Resource: [
    //             "arn:aws:athena:ap-southeast-1:*:workgroup/*"
    //         ]
    //     },

    // ]


}

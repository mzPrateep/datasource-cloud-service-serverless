import apiResponse from '../../configs/apiResponse'

export default {
    handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
    events: [
        {
            http: {
                method: 'get',
                path: 'auditLog/get/execution',
                integration: 'lambda',
                cors: {
                    origin: "*",
                },
                request: {},
                response: apiResponse,

            }
        }
    ],
    iamRoleStatements: [
        {
            Effect: "Allow",
            Action: [
                "athena:GetQueryExecution"
            ],
            Resource: [
                "arn:aws:athena:ap-southeast-1:411331149567:workgroup/*"
            ]
        },

    ]


}

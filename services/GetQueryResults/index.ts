import apiResponse from '../../configs/apiResponse'

export default {
    handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
    events: [
        {
            http: {
                method: 'post',
                path: 'auditLog/get/results',
                integration: 'lambda',
                cors: {
                    origin: "*",
                    // headers: ['rolearn', 'rolesessionname', 'Content-Type', 'Access-Control-Allow-Origin']
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
                "athena:GetQueryResults"
            ],
            Resource: [
                "arn:aws:athena:ap-southeast-1:411331149567:workgroup/*"
            ]
        },
        {
            Effect: "Allow",
            Action: [
                "s3:GetObject",
            ],

            Resource: [
                "arn:aws:s3:::athena-ppa-output/*",
                "arn:aws:s3:::athena-ppa-output",

            ]
        }

    ]

}

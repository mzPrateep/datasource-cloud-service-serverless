import apiResponse from '../../configs/apiResponse'

export default {
    handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
    events: [
        {
            http: {
                method: 'post',
                path: 'describeServices',
                integration: 'lambda',
                cors: {
                    origin: "*",
                    // headers: ['rolearn', 'rolesessionname', 'Content-Type', 'Access-Control-Allow-Origin']
                },
                request: {},
                response: apiResponse,

            }
        }
    ]

}

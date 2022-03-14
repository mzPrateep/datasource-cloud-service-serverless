import apiResponse from '../../configs/apiResponse'

export default {
    handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
    events: [
        {
            http: {
                method: 'post',
                path: 'datasource/aws/getToken',
                integration: 'lambda',
                cors: {
                    origin: "*",
                },
                request: {},
                response: apiResponse,

            }
        }
    ],


}

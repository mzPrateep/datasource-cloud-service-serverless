import apiResponse from '../../configs/apiResponse'

export default {
    handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
    events: [
        {
            http: {
                method: 'get',
                path: 'datasource/aws/inventory/listaccountorg',
                integration: 'lambda',
                cors: {
                    origin: "*",
                    headers: ['rolearn', 'rolesessionname', 'Content-Type', 'Access-Control-Allow-Origin']
                },
                request: {},
                response: apiResponse,

            }
        }
    ],


}

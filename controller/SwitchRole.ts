import { SwitchRoleProps } from '../interfaces/SwitchRole'
import { assumeRole } from '../services/STS/assumeRole'
import { AWSError } from 'aws-sdk'
import { AssumeRoleResponse } from 'aws-sdk/clients/sts'

class SwitchRole {
    RoleArn: string;
    RoleSessionName: string;
    constructor() {
        this.RoleArn = " "
        this.RoleSessionName = " "
    }

    setData(params: SwitchRoleProps) {
        this.RoleArn = params.RoleArn
        this.RoleSessionName = params.RoleSessionName
    }
    async SwitchRole(params?: any): Promise<AssumeRoleResponse | AWSError> {
        try {
            let paramsAssumeRole = {
                RoleArn: params.RoleArn,
                RoleSessionName: params.RoleSessionName
            }
            let AssumeRole_log = await assumeRole(paramsAssumeRole)
            console.log("AssumeRole_log : ", AssumeRole_log);


            return AssumeRole_log;

        } catch (error) {
            return error.stack;
        }
    }

}
export default SwitchRole
import { Callback, Context } from 'aws-lambda';

import SwitchRolerController from '../../controller/SwitchRole'
import { listAccounts } from '../Organizations/listAccounts'
import Success from '../../controller/Success'
import Error from '../../controller/Error'

const ListOrgAccounts = async (event?: any, _?: Context, callback?: Callback) => {
    try {
        console.log("event : ", event);

        /**
         * @description
         * @params {RoleArn : "string", RoleSessionName : "string"} 
         */

        const { rolearn: RoleArn, rolesessionname: RoleSessionName } = event.headers

        let params = {
            RoleArn,
            RoleSessionName
        }
        let switchRole: any = await new SwitchRolerController().SwitchRole(params)

        // console.log("switchRole : ", switchRole);

        if (switchRole.code) {
            return callback(JSON.stringify(
                new Error(
                    400,
                    switchRole.message,
                    'SwitchRole'
                )
            ));
        } else {
            let listAccountsRES = []
            let listAccounts_res: any = await listAccounts({}, switchRole.Credentials, null)
            listAccountsRES = listAccounts_res.Accounts
            while (listAccounts_res.NextToken) {
                listAccounts_res = await listAccounts({}, switchRole.Credentials, listAccounts_res.NextToken)
                // console.log("listAccounts_res : ", listAccounts_res);

                listAccountsRES = listAccountsRES.concat(listAccounts_res.Accounts);
            }
            console.log("listAccountsRES : ", listAccountsRES.length);

            return new Success(listAccountsRES)
        }

    } catch (error) {
        return callback(JSON.stringify(
            new Error(
                400,
                JSON.stringify(error.stack),
                'ListOrgAccounts'
            )
        ));
    }
}
// let event = {
//     headers: {
//         rolearn: `arn:aws:iam::245747666211:role/ppa-master-role`,
//         rolesessionname: "MasterAccountCreate"
//     }
// }
// ListOrgAccounts(event)
export const main = ListOrgAccounts;
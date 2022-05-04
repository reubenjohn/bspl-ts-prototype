import {main_government} from "./goverment";
import {main_contractor} from "./contractor";
import {MockMessageInfrastructure} from "../mock_infrastructure";
import {decomposeIrl} from "../../protocol";
import {staticRoleBinding} from "./common";

(async () => {
    console.log('Starting demo3');
    const governmentMessageInfrastructure = await MockMessageInfrastructure.newAndReady("Government", decomposeIrl(staticRoleBinding["Government"]).port);
    const contractorMessageInfrastructure = await MockMessageInfrastructure.newAndReady("Contractor", decomposeIrl(staticRoleBinding["Contractor"]).port);
    await Promise.all([
        main_government(governmentMessageInfrastructure),
        main_contractor(contractorMessageInfrastructure)
    ]);
    console.log(`demo3 complete`);
    governmentMessageInfrastructure.close();
    contractorMessageInfrastructure.close();
})();

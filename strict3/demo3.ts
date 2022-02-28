import {main_government} from "./demo3_goverment";
import {main_contractor} from "./demo3_contractor";
import {MockMessageInfrastructure} from "./mock_infrastructure";
import {decomposeIrl} from "./protocol";
import {staticRoleBinding} from "./demo3_common";

(async () => {
    console.log('Starting demo3');
    const governmentMessageInfrastructure = new MockMessageInfrastructure(decomposeIrl(staticRoleBinding["Government"]).port);
    const contractorMessageInfrastructure = new MockMessageInfrastructure(decomposeIrl(staticRoleBinding["Contractor"]).port);
    await Promise.all([
        main_government(governmentMessageInfrastructure),
        main_contractor(contractorMessageInfrastructure)
    ]);
    console.log(`demo3 complete`);
    governmentMessageInfrastructure.close();
    contractorMessageInfrastructure.close();
})();

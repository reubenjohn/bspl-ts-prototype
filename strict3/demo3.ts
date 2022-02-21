import {main_government} from "./demo3_goverment";
import {main_contractor} from "./demo3_contractor";

const govPromise = main_government();
const contractorPromise = main_contractor();


govPromise.then(console.log);
contractorPromise.then(console.log);

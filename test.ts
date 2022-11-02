import { InlineProgramArgs, LocalWorkspace } from "@pulumi/pulumi/automation";
import { createPulumiProgram, createCustomProgram } from "./factory";
import { env, argv} from 'process'

const args = argv.slice(2)

console.log('Morphaux, run test with arguments: ', args);

const upOrDown = args[0]
if( !(upOrDown == 'up' || upOrDown == 'dn')) {
    throw new Error("Command must be either  up or dn")
}

const stackName = args[1]
const provider = args[2]
const service = args[3]

const stackArgs: InlineProgramArgs = {
    stackName: stackName,
    projectName: "morphaux",
    program: createPulumiProgram(stackName, provider, service)
};

const customProgram = createCustomProgram(stackName, provider, service)

const run = async () => {
    const ws = await LocalWorkspace.create({workDir: env.PWD});
    const stack = await LocalWorkspace.createOrSelectStack(stackArgs);
    console.info("***log: created/selected " + stackArgs.stackName);
    const startTime = Date.now();
    const upRes = await stack.up({ onOutput: console.info });
    // await stack.destroy({onOutput: console.info});
    const callReturnTime = ((Date.now() - startTime)/60000).toString(); // minutes
    // console.log("***log: do we get here 1");
    await ws.setConfig(stackArgs.stackName, "ns:callReturnTime", {value: callReturnTime});
    // console.log("***log: do we get here 2", upRes.outputs.envUrl.value);
    // wait until it's up, probing at upRes.outputs.envUrl.value
    // let startupTime2 = 0;
    const configOut = await ws.getAllConfig(stackArgs.stackName);
    console.info("***log: final config data", configOut);
}

// run().catch(err => console.log(err));

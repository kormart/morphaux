import * as pulumi from "@pulumi/pulumi";
import * as equinix_metal from "@pulumi/equinix-metal";
import * as aws from "@pulumi/aws";
// import * as gcp from "@pulumi/gcp";
import * as gcp_dataproc from "@pulumi/google-native/dataproc";
import * as gcp_compute from "@pulumi/gcp/compute";
// import * as gcp_serviceaccount from "@pulumi/gcp/serviceaccount";
import * as gcp_cloudrun from "@pulumi/gcp/cloudrun";
// import {resources as az_resources, hdinsight as az_hdinsight} from "@pulumi/azure-native";
// import * as az_hdinsight from "@pulumi/azure-native/hdinsight";
import * as az_resources from "@pulumi/azure-native/resources";
import * as az_aci from "@pulumi/azure-native/containerinstance";
import { InlineProgramArgs, LocalWorkspace } from "@pulumi/pulumi/automation";
// import fetch from "node-fetch-commonjs";
import { env } from 'process';

const imageNameIce = "registry.ice.ri.se/ai-center/streamlit:latest"
// const imageNameAz = "hopsaks.azurecr.io/riseai/streamlit:latest"
const imageNameAz1 = "hopsaks.azurecr.io/riseai/test2:latest"
const imageNameAz2 = "hopsaks.azurecr.io/riseai/tf-jupyterlab:latest"
const imageNameGcp1 = "europe-west4-docker.pkg.dev/test-35178/backabo/test2"
const imageNameGcp2 = "europe-west4-docker.pkg.dev/test-35178/backabo/tf-jupyterlab"

const portNumber = 5051;
const portNumber1 = 5051;
const portNumber2 = 8888;
const vcpu = 2;

// the program components are generated in function factories, because later we want to generate different version depending on the provider

function factoryMachine(provider: string) {
    switch(provider) {
        case 'gcp':
            return (instanceName: string) => {
                const project = "test-35178";
                const locationGcp = "europe-west4-a";

                // const defaultAccount = new gcp_serviceaccount.Account("defaultAccount", {
                //     accountId: "565432897551-compute@developer.gserviceaccount.com",
                //     displayName: "Service Account",
                // });
                // Create a network
                const network = new gcp_compute.Network("network");
                const computeFirewall = new gcp_compute.Firewall("firewall", {
                    network: network.name,
                    allows: [{
                        protocol: "tcp",
                        ports: [ "22" ],
                    }],
                    sourceRanges: ["0.0.0.0/0"]
                });

                // Create a Virtual Machine Instance
                const computeInstance = new gcp_compute.Instance(instanceName, {
                    labels: {name: "t2a-2-8-ubuntu2204"},
                    machineType: "t2a-standard-2",
                    zone: locationGcp,
                    bootDisk: { initializeParams: { image: "ubuntu-2204-lts-arm64" } },
                    networkInterfaces: [{
                        network: network.id,
                        // accessConfigus must includ a single empty config to request an ephemeral IP
                        accessConfigs: [{}],
                    }],
                    metadata: {
                        'ssh-keys': 'kormart:ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDBCu0s5YNk4iA/ONZP5CS549sz73VixHbJI2hCj2bcm3M8soYQJGfmHArSYWTPuf1vF24ltcF1n7ZUua4VLA9iajX5GZDkrl4MAeHTSSWtRBNPG2Ss/TqqMNnNjJswLELg40WqU/xB710VWy2Fov1vG9wOx9+iMd+ZlDq8W3Pk3InpTkWhysu3Inech/Y3kLFvJJNlNoSn7exLw53xTzOOAs5XIXMMCbQtG0dBmalU/arKLaPwHrg6klMcZodM2NtotOR6JcLtVIAnzJHwG5EFFX/s05/OWCLd+lFNagrSgQ/JlPdDW8nm/KS8gFGruaXGS2NpSgcbU2UibiH+l1VlTkpT3NRcTVNFq8fLfKt0k5wMOE5iAghRsQu0Nce1SEDcNubzg0VywkSlqxJJBqhibXu8FN6nZaF54DtOsCsHYIPROaq93jJ3OjKx77pWEb7aSXaexN0BhXjzMjEnTDtVw3ShMe5EZ4loiMEbpjbJRfMNvRn9bpSnx2X8hea+q+SNWoSD/nrjVm7W5eYw8LG/mOmFxWRxXPbR/vjqK+u7GyTpH2Z+cRLTi3UUmnzc8G6gal93ezw+b4VgxoWfgU8ncttsEOdI18bpzptcaswNr7HBeg/mURzuTq3kUDozKmoXEsIe/lMf3V64DdFde172AeBJSr5nOpeinRDXIRraIQ== kormart\n' +
                        'bjorn:ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDa66PjMNK/7k1QOdF8uwfQN7z6GziCKT8RvDd/C7NBi5j3KT+Alj9os1vDpv5b4Lm1qHJm66/REBQnCAUCpMi8/W9QvnCgerPfsK+rXJwhfs9mj8gehqO+Dt+ODTFWeURf1L7vEYiPzcneT1v8MTsEerjou/1x2Z88cq4ZKQLkw5PuqjHym0/CfbEnLF5rJg9rVAe5bgRqoH9n5ZSIjI8oKNRQbTF/V1n5YKLx8mqfq/MuY/7zuFxJDK9lqnysOn7jj1UGL/FFEjcGh6/3kq880obcBIM8/I8vxrqe0unQ8bkkmbue+SPmaHLzBd328B+myVcpIeZg9ox+J9JFpiJEby4yx4znJbtzCA9enrrQprBsFMibgxQPKacH2z5AzuXO0BlrU8mWS1sxo4z/tO/uZ2dGUcrX/qCRrzBORrQG2V2JACzbVFX5V5jes+3J00gBagZLNfMuUZu0rPGFVp1vl29IX0AJpynN4vWuusD3cUUlkX/kgZj7kqBXw2N8rri5QytvctFAYbd+3BmBmcMIZhCco1jkQKhSRZx/QOUh8wZ+N4crI7SaZLHrBDygzzTrAa97hWazmHeKPW+CJgMC/mMWSPz9+v8q6I4+4MZ4ty2KSKMFC0a/eZLMKr9N6p8z49elz7vEubZhRCxDpOjdp5eJH7JnueGr0sm8X9/F4Q== bjorn', 
                        'enable-oslogin': 'FALSE'
                    },
                    // serviceAccount: {
                    //       email: "565432897551-compute@developer.gserviceaccount.com",
                    //       scopes: ["cloud-platform"]
                    // }
                });
                return {
                    envUrl: computeInstance.name // computeInstance.networkInterfaces.apply(ni => ni[0].accessConfigs[0].natIp)
                };            
            } // end case gcp
            case 'equinix':
                return (instanceName: string) => {
                    const project = "1236b848-19d1-48c6-8a12-04ddf3b38d47";
                    const machine = new equinix_metal.Device(instanceName, {
                        hostname: instanceName,
                        plan: "c3.large.arm64",
                        metro: "da",
                        operatingSystem: "ubuntu_22_04",
                        billingCycle: "hourly",
                        projectId: project,
                    });
                    return {
                        envUrl: machine.accessPublicIpv4 // computeInstance.networkInterfaces.apply(ni => ni[0].accessConfigs[0].natIp)
                    };            
                } // end case equinix
                case 'aws':
                return (instanceName: string) => {
                    const size = "m6i.metal";     // t2.micro is available in the AWS free tier
                    const deployer0 = new aws.ec2.KeyPair("deployer0", {
                        publicKey: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDBCu0s5YNk4iA/ONZP5CS549sz73VixHbJI2hCj2bcm3M8soYQJGfmHArSYWTPuf1vF24ltcF1n7ZUua4VLA9iajX5GZDkrl4MAeHTSSWtRBNPG2Ss/TqqMNnNjJswLELg40WqU/xB710VWy2Fov1vG9wOx9+iMd+ZlDq8W3Pk3InpTkWhysu3Inech/Y3kLFvJJNlNoSn7exLw53xTzOOAs5XIXMMCbQtG0dBmalU/arKLaPwHrg6klMcZodM2NtotOR6JcLtVIAnzJHwG5EFFX/s05/OWCLd+lFNagrSgQ/JlPdDW8nm/KS8gFGruaXGS2NpSgcbU2UibiH+l1VlTkpT3NRcTVNFq8fLfKt0k5wMOE5iAghRsQu0Nce1SEDcNubzg0VywkSlqxJJBqhibXu8FN6nZaF54DtOsCsHYIPROaq93jJ3OjKx77pWEb7aSXaexN0BhXjzMjEnTDtVw3ShMe5EZ4loiMEbpjbJRfMNvRn9bpSnx2X8hea+q+SNWoSD/nrjVm7W5eYw8LG/mOmFxWRxXPbR/vjqK+u7GyTpH2Z+cRLTi3UUmnzc8G6gal93ezw+b4VgxoWfgU8ncttsEOdI18bpzptcaswNr7HBeg/mURzuTq3kUDozKmoXEsIe/lMf3V64DdFde172AeBJSr5nOpeinRDXIRraIQ== eramkog",
                    });
                    const deployer1 = new aws.ec2.KeyPair("deployer1", {
                        publicKey: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDa66PjMNK/7k1QOdF8uwfQN7z6GziCKT8RvDd/C7NBi5j3KT+Alj9os1vDpv5b4Lm1qHJm66/REBQnCAUCpMi8/W9QvnCgerPfsK+rXJwhfs9mj8gehqO+Dt+ODTFWeURf1L7vEYiPzcneT1v8MTsEerjou/1x2Z88cq4ZKQLkw5PuqjHym0/CfbEnLF5rJg9rVAe5bgRqoH9n5ZSIjI8oKNRQbTF/V1n5YKLx8mqfq/MuY/7zuFxJDK9lqnysOn7jj1UGL/FFEjcGh6/3kq880obcBIM8/I8vxrqe0unQ8bkkmbue+SPmaHLzBd328B+myVcpIeZg9ox+J9JFpiJEby4yx4znJbtzCA9enrrQprBsFMibgxQPKacH2z5AzuXO0BlrU8mWS1sxo4z/tO/uZ2dGUcrX/qCRrzBORrQG2V2JACzbVFX5V5jes+3J00gBagZLNfMuUZu0rPGFVp1vl29IX0AJpynN4vWuusD3cUUlkX/kgZj7kqBXw2N8rri5QytvctFAYbd+3BmBmcMIZhCco1jkQKhSRZx/QOUh8wZ+N4crI7SaZLHrBDygzzTrAa97hWazmHeKPW+CJgMC/mMWSPz9+v8q6I4+4MZ4ty2KSKMFC0a/eZLMKr9N6p8z49elz7vEubZhRCxDpOjdp5eJH7JnueGr0sm8X9/F4Q== bjorn",
                    });
                    const myVpc = new aws.ec2.Vpc("main", {
                        cidrBlock: "10.0.0.0/16",
                    });
                    const mySubnet = new aws.ec2.Subnet("mySubnet", {
                        vpcId: myVpc.id,
                        mapPublicIpOnLaunch: true, // public
                        cidrBlock: "10.0.1.0/24",
                    });
                    // Create a gateway for internet connectivity:
                    const prodIgw = new aws.ec2.InternetGateway("prod-igw", {vpcId: myVpc.id});

                    // Create a route table:
                    const prodPublicRt = new aws.ec2.RouteTable("prod-public-rt", {
                        vpcId: myVpc.id,
                        routes: [{
                            // associated subnets can reach anywhere.
                            cidrBlock: "0.0.0.0/0",
                            // use this IGW to reach the internet.
                            gatewayId: prodIgw.id,
                        }],
                    });
                    const prodRtaPublicSubnet1 = new aws.ec2.RouteTableAssociation("prod-rta-public-subnet-1", {
                        subnetId: mySubnet.id,
                        routeTableId: prodPublicRt.id,
                    });

                    const ubuntu = aws.ec2.getAmi({
                        mostRecent: true,
                        filters: [
                            {
                                name: "name",
                                values: ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"],
                            },
                            {
                                name: "virtualization-type",
                                values: ["hvm"],
                            },
                        ],
                        owners: ["099720109477"],
                    });

                    const group = new aws.ec2.SecurityGroup("secgrp", {
                        vpcId: myVpc.id,
                        ingress: [
                            { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"] },
                        ],
                        egress: [{
                            fromPort: 0,
                            toPort: 0,
                            protocol: "-1",
                            cidrBlocks: ["0.0.0.0/0"],
                        }],
                    });
                    
                    const server = new aws.ec2.Instance(instanceName, {
                        instanceType: size,
                        keyName: deployer0.id,
                        // keyName: deployer1.id,
                        tags: {
                            name: instanceName,
                        },
                        subnetId: mySubnet.id,
                        vpcSecurityGroupIds: [ group.id ], // reference the security group resource above
                        ami: ubuntu.then(ubuntu => ubuntu.id),
                    });
                    return {
                        envUrl: server.publicIp
                    };            
                } // end case aws
            default:
            return () => {}  
    } // end switch

}

function factoryContainer(provider: string) {
    switch(provider) {
        case 'gcp':

            return (containerName: string) => {
                const project = "test-35178";
                const locationGcp = "europe-west4";
                const containerName1 = containerName + "-1";
                const containerName2 = containerName + "-2";
                const instanceContainer1 = new gcp_cloudrun.Service(containerName1, {
                    location: locationGcp,
                    template: {
                        spec: {
                            containers: [
                                { image: imageNameGcp1,
                                    ports: [{"containerPort": portNumber1}],
                                    resources: {
                                        limits: {                                           
                                            memory: "1Gi",
                                        },
                                    } 
                                }
                            ],
                        },
                    },
                });
                // const instanceContainer2 = new gcp_cloudrun.Service(containerName2, {
                //     location: locationGcp,
                //     template: {
                //         spec: {
                //             containers: [
                //                 { image: imageNameGcp2,
                //                     ports: [{"containerPort": portNumber2}],
                //                     resources: {
                //                         limits: {                                           
                //                             memory: "1Gi",
                //                         },
                //                     } 
                //                 }
                //             ],
                //         },
                //     },
                // });
                const iamHello1 = new gcp_cloudrun.IamMember(containerName1, {
                    service: instanceContainer1.name,
                    location: locationGcp,
                    role: "roles/run.invoker",
                    member: "allUsers",
                });
                // const iamHello2 = new gcp_cloudrun.IamMember(containerName2, {
                //     service: instanceContainer2.name,
                //     location: locationGcp,
                //     role: "roles/run.invoker",
                //     member: "allUsers",
                // });
                return {
                    envUrl: instanceContainer1.statuses[0].url
                };            
            }
        

        case 'azure':

            return async (containerName: string) => {
                const resourceGroupNameBase="rise-ai-center-test";
                const resourceGroupLocation="westeurope";
    
                const resourceGroup = new az_resources.ResourceGroup(resourceGroupNameBase, {
                    location: resourceGroupLocation,
                    // resourceGroupName: resourceGroupNameBase,
                });
                const containerGroup = new az_aci.ContainerGroup("containerGroup", {
                    containerGroupName: "containerGroup"+containerName,
                    containers: [{
                        command: [],
                        environmentVariables: [],
                        image: imageNameAz2,
                        name: containerName,
                        ports: [{
                            port: portNumber2,
                        }],
                        resources: {
                            requests: {
                                cpu: 4.0,
                                // gpu: {
                                //     count: 1,
                                //     sku: "K80",
                                // },
                                memoryInGB: 8,
                            },
                        },
                        volumeMounts: [
                            {
                                mountPath: "/tf/file-share",
                                name: "volume1",
                                readOnly: false,
                            },
                        ],
                    }],
                    imageRegistryCredentials: [
                        {
                            server: "hopsaks.azurecr.io",
                            username: "hopsaks",
                            password: "xTDRyjHHVNkuBhzlzsHDv=XBydYukYTE",
                    }
                    ],
                    ipAddress: {
                        dnsNameLabel: containerName,
                        ports: [{
                            port: portNumber2,
                            protocol: "TCP",
                        }],
                        type: "Public",
                    },
                    location: resourceGroupLocation,
                    // networkProfile: {
                    //     id: "test-network-profile-id",
                    // },
                    osType: "Linux",
                    resourceGroupName: resourceGroup.name,
                    volumes: [
                        {
                            azureFile: {
                                shareName: "azureml-filestore-a3577153-b708-4da7-ba96-d3d8997a0cac",
                                storageAccountKey: env.storageAccountKey,
                                storageAccountName: "riseaicenter9576892428",
                            },
                            name: "volume1",
                        },
                    ],
                });
    
                return {
                    // envIp: containerGroup.ipAddress.ip,
                    envUrl: containerName + ".westeurope.azurecontainer.io"+portNumber+"/lab"
                };
            } // end case azure
            default:
                return () => {}  
    } // end switch
} 


function factorySparkJob() {
    return (clusterName: pulumi.Output<string>) => {
        const project = "test-35178";
        const locationGcp = "europe-west4";
        const jobName = "test-spark-job-01";
        const mainPythonFileUri = "gs://dataproc-examples/pyspark/hello-world/hello-world.py"
        let jobArgs : gcp_dataproc.v1.JobArgs = {project,  placement: {clusterName}, region: locationGcp, pysparkJob: {mainPythonFileUri}};
        const myJob = new gcp_dataproc.v1.Job(jobName, jobArgs);
    }
} 

const factorySparkCluster = () => {
    return (clusterName: string, sparkJob: Function) => {
        const project = "test-35178";
        const locationGcp = "europe-west4";
        const clusterArgsGcp : gcp_dataproc.v1.ClusterArgs = {
            clusterName, 
            project,
            region: locationGcp, 
            config: { 
                // autoscalingConfig: autoscalingPolicyArgsGcp,
                lifecycleConfig: {
                    autoDeleteTtl: "600s",
                },
                masterConfig: {
                    numInstances: 1,
                    machineTypeUri: "n1-standard-2",
                    diskConfig: {
                        bootDiskSizeGb: 500,
                    }
                },
                softwareConfig: {
                    properties: {
                        "dataproc:dataproc.allow.zero.workers": "true"
                    },
                },
                
            }
        };
        const newSparkCluster = new gcp_dataproc.v1.Cluster(clusterName, clusterArgsGcp);
        sparkJob(newSparkCluster.clusterName);
    }
}

// set provider
const provider = 'equinix';
// const provider = 'aws';
// const provider = 'gcp';
// const provider = 'azure';
const instanceName = "rise-eq-c3.arm64";

// generate the component functions
const sparkJob = factorySparkJob();
const sparkCluster = factorySparkCluster();
const container = factoryContainer(provider);
const machine = factoryMachine(provider);

// and now the program is composed from the components, with a continuation
const program = async () => {
    // sparkCluster(instanceName, sparkJob);
    // container(instanceName);
    machine(instanceName);
}

const args: InlineProgramArgs = {
    stackName: instanceName,
    projectName: "proj-test",
    program
};

// re-write this to be a test program for creating and deleting resources and 
// measuring successes/failures, times, 
// 1. measure time elapsed for the pulumi up call to return
// 2. measure time elapsed until the resource is reachable thru some means 
// const probe = (url: string) => {
// }

const run = async () => {
    const ws = await LocalWorkspace.create({workDir: "/Users/martinko/Code/pulumi-typescript-dev/test"});
    const stack = await LocalWorkspace.createOrSelectStack(args);
    console.info("***log: created/selected " + args.stackName);
    const startTime = Date.now();
    const upRes = await stack.up({ onOutput: console.info });
    // await stack.destroy({onOutput: console.info});
    const callReturnTime = ((Date.now() - startTime)/60000).toString(); // minutes
    // console.log("***log: do we get here 1");
    await ws.setConfig(args.stackName, "ns:callReturnTime", {value: callReturnTime});
    // console.log("***log: do we get here 2", upRes.outputs.envUrl.value);
    // wait until it's up, probing at upRes.outputs.envUrl.value
    // let startupTime2 = 0;
    const configOut = await ws.getAllConfig(args.stackName);
    console.info("***log: final config data", configOut);
}

run().catch(err => console.log(err));

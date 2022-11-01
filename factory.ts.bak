import * as equinix_metal from "@pulumi/equinix-metal";
import * as aws from "@pulumi/aws";
import * as gcp_compute from "@pulumi/gcp/compute";
import * as az_resources from "@pulumi/azure-native/resources";
import * as az_aci from "@pulumi/azure-native/containerinstance";
import * as gcp_cloudrun from "@pulumi/gcp/cloudrun";
// import * as gcp from "@pulumi/gcp";
import * as rancher2 from "@pulumi/rancher2";
import {factoryCustom} from "./factoryCustom"
import { env } from 'process';
const { spawn } = require('child_process')

// this function returns different pulumi programs depending on arguments, for example
// an Azure ACI container, or a Rancher Helm application
export const createPulumiProgram = (selected, envName: string) => {
    const service = selected.infra.type;
    const provider = selected.infra.provider;
    // call different orchlet factories according to service
    switch(service) {
        case 'machine':
            return factoryMachine(provider, envName);
        case 'container':
            return factoryContainer(provider, envName);
        case 'custom':
            return async () => {};
        default:
            return async () => {};
    }
}

export const createCustomProgram = (selected, envName: string) => {
    const service = selected.infra.type;
    const provider = selected.infra.provider;
    // call different orchlet factories according to service
    switch(service) {
        case 'custom':
            return factoryCustom(provider, envName);
        default:
            return async () => {};
        }
}

// function factoryCustom(provider, envName) {
//     switch(provider) {
//         case 'gcp':
//             return async () => {
//                 spawn('node ../custom/training-text-custom.js', [], { shell: true, stdio: 'inherit' });
//             }
//     }
// }

function factoryMachine(provider: string, envName: string) {
    switch(provider) {
        case 'gcp':
            return async () => {
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
                const computeInstance = new gcp_compute.Instance(envName, {
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
            case 'equinix-metal':
                // return async () => {
                //     const projectId = "1236b848-19d1-48c6-8a12-04ddf3b38d47";
                //     const userData = 
                //     `#!/bin/bash
                //     export DEBIAN_FRONTEND=noninteractive
                //     apt-get update && apt-get upgrade -y
                //     apt-get install wget -y
                    
                //     wget https://aka.ms/downloadazcopy-v10-linux
                //     tar -xvf downloadazcopy-v10-linux
                //     sudo cp ./azcopy_linux_amd64_*/azcopy /usr/bin/
                //     sudo chmod 755 /usr/bin/azcopy `;
                //     const machine = new equinix_metal.SpotMarketRequest(envName, {
                //         projectId,
                //         maxBidPrice: 0.6,
                //         metro: "da",
                //         devicesMin: 1,
                //         devicesMax: 1,
                //         instanceParameters: {
                //             hostname: envName,
                //             billingCycle: "hourly",
                //             operatingSystem: "ubuntu_22_04",
                //             plan: "c3.large.arm64",
                //             userdata: userData
                //         },
                //     });
                //     return {
                //         // envUrl: machine.accessPublicIpv4 // computeInstance.networkInterfaces.apply(ni => ni[0].accessConfigs[0].natIp)
                //     };            
                // } // end case equinix
                return async () => {
                    const projectId = "1236b848-19d1-48c6-8a12-04ddf3b38d47";
                    const userData = 
                    `#!/bin/bash
                    export DEBIAN_FRONTEND=noninteractive
                    apt-get update && apt-get upgrade -y
                    apt-get install wget -y
                    
                    wget https://aka.ms/downloadazcopy-v10-linux
                    tar -xvf downloadazcopy-v10-linux
                    sudo cp ./azcopy_linux_amd64_*/azcopy /usr/bin/
                    sudo chmod 755 /usr/bin/azcopy `;
                    const machine = new equinix_metal.Device(envName, {
                        hostname: envName,
                        plan: "c3.large.arm64",
                        metro: "da",
                        operatingSystem: "ubuntu_22_04",
                        billingCycle: "hourly",
                        projectId,
                        userData
                    });
                    return {
                        envUrl: machine.accessPublicIpv4 // computeInstance.networkInterfaces.apply(ni => ni[0].accessConfigs[0].natIp)
                    };            
                } // end case equinix
            case 'aws':
                return async () => {
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
                    
                    const server = new aws.ec2.Instance(envName, {
                        instanceType: size,
                        keyName: deployer0.id,
                        // keyName: deployer1.id,
                        tags: {
                            name: envName,
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
            return async () => {}  
    } // end switch factoryMachine

}

const factoryContainer = (provider, envName: string) => {
    const images = {
        'azure': 'hopsaks.azurecr.io/riseai/bench-lab-gpu:latest',
        'ice': 'registry.ice.ri.se/ai-center/streamlit:latest',
        'gcp': 'europe-west4-docker.pkg.dev/test-35178/backabo/tf-jupyterlab' 
    };
    // imageNameIce = "registry.ice.ri.se/ai-center/streamlit:latest"
    // const imageName2 = "kormart/tf-jupyterlab:latest"
    // const imageName2 = "tensorflow/tensorflow:1.12.0-gpu-py3"
    // const imageName2 = "hopsaks.azurecr.io/riseai/bench-lab-gpu:latest"
    // const imageNameAz = "hopsaks.azurecr.io/riseai/streamlit:latest"
    // const imageNameGcp = "europe-west4-docker.pkg.dev/test-35178/backabo/tf-jupyterlab"
    // const imageName2 = "docker.io/tensorflow/tensorflow:latest-gpu-jupyter"
    const imageName = images[provider];
    switch(provider) {
        case 'gcp':
            return async () => {
                const location='europe-west4';
                const helloService = new gcp_cloudrun.Service("hello", {
                    location,
                    template: {
                        spec: {
                            containers: [
                                { image: imageName,
                                    ports: [{"containerPort": 8888}],
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
                const iamHello = new gcp_cloudrun.IamMember("hello-everyone", {
                    service: helloService.name,
                    location,
                    role: "roles/run.invoker",
                    member: "allUsers",
                });
                return {
                    envUrl: helloService.statuses[0].url
                };            
            }
        case 'azure':
            return async () => {
                const resourceGroupNameBase="rise-ai-center-test";
                const resourceGroupLocation="westeurope";

                const resourceGroup = new az_resources.ResourceGroup(resourceGroupNameBase, {
                    location: resourceGroupLocation,
                    // resourceGroupName: resourceGroupNameBase,
                });
                const containerGroup = new az_aci.ContainerGroup("containerGroup", {
                    containerGroupName: "containerGroup"+envName,
                    containers: [{
                        command: [],
                        environmentVariables: [],
                        image: imageName,
                        name: envName,
                        ports: [{
                            port: 5051,
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
                    // diagnostics: {
                    //     logAnalytics: {
                    //         logType: "ContainerInsights",
                    //         metadata: {
                    //             "test-key": "test-metadata-value",
                    //         },
                    //         workspaceId: "workspaceid",
                    //         workspaceKey: "workspaceKey",
                    //     },
                    // },
                    // dnsConfig: {
                    //     nameServers: ["1.1.1.1"],
                    //     options: "ndots:2",
                    //     searchDomains: "cluster.local svc.cluster.local",
                    // },
                    // identity: {
                    //     type: "SystemAssigned, UserAssigned",
                    //     userAssignedIdentities: {
                    //         "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/myResourceGroup/providers/Microsoft.ManagedIdentity/userAssignedIdentities/identity-name": {},
                    //     },
                    // },
                    imageRegistryCredentials: [
                        {
                            server: "hopsaks.azurecr.io",
                            username: "hopsaks",
                            password: "xTDRyjHHVNkuBhzlzsHDv=XBydYukYTE",
                    }
                    ],
                    ipAddress: {
                        dnsNameLabel: envName,
                        ports: [{
                            port: 5051,
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
                    envIp: containerGroup.ipAddress.ip,
                    envUrl: envName + ".westeurope.azurecontainer.io:8888/lab"
                };
            }
        case 'ice':
            return async () => {
                const myApp = new rancher2.App(envName, {
                    name: envName,
                    catalogName: "c-tmfxj:rise-charts" , 
                    projectId: "c-tmfxj:p-rwjhj", 
                    targetNamespace: "rise-ai-testns", 
                    templateName: "jupyternode",
                    answers: {
                        "altjupyterhome": "true",
                        "cmdscript": "",
                        "dockerimage": imageName,
                        "gitemail": "",
                        "gitname": "",
                        "gpu.amount": "1",
                        "gpu.enable": "true",
                        "gpu.type": "nvidia-gtx-2080ti",
                        "homedir": "/home/jovyan",
                        "nbcheck": "true",
                        "odcaccess": "true",
                        "pvcSize": "10Gi",
                        "resourceLimits.cpu": "4000m",
                        "resourceLimits.memory": "8Gi",
                        "s3.access": "false",
                        "sharedvolumes": "rise-ai-shared-vol",
                        "sshaccess": "true",
                        "sshinstall": "Install and start",
                        "sshpubkey": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDBCu0s5YNk4iA/ONZP5CS549sz73VixHbJI2hCj2bcm3M8soYQJGfmHArSYWTPuf1vF24ltcF1n7ZUua4VLA9iajX5GZDkrl4MAeHTSSWtRBNPG2Ss/TqqMNnNjJswLELg40WqU/xB710VWy2Fov1vG9wOx9+iMd+ZlDq8W3Pk3InpTkWhysu3Inech/Y3kLFvJJNlNoSn7exLw53xTzOOAs5XIXMMCbQtG0dBmalU/arKLaPwHrg6klMcZodM2NtotOR6JcLtVIAnzJHwG5EFFX/s05/OWCLd+lFNagrSgQ/JlPdDW8nm/KS8gFGruaXGS2NpSgcbU2UibiH+l1VlTkpT3NRcTVNFq8fLfKt0k5wMOE5iAghRsQu0Nce1SEDcNubzg0VywkSlqxJJBqhibXu8FN6nZaF54DtOsCsHYIPROaq93jJ3OjKx77pWEb7aSXaexN0BhXjzMjEnTDtVw3ShMe5EZ4loiMEbpjbJRfMNvRn9bpSnx2X8hea+q+SNWoSD/nrjVm7W5eYw8LG/mOmFxWRxXPbR/vjqK+u7GyTpH2Z+cRLTi3UUmnzc8G6gal93ezw+b4VgxoWfgU8ncttsEOdI18bpzptcaswNr7HBeg/mURzuTq3kUDozKmoXEsIe/lMf3V64DdFde172AeBJSr5nOpeinRDXIRraIQ== martin.korling",
                        "subdomain": envName + ".icedc.se",
                        "token": "wdr5tywdr5ty"
                        },
                });
                return { 
                    envIp: myApp.description,
                    envUrl: envName + ".icedc.se" 
                };
                
            }
        case 'test':
            return async () => {
                return {
                    envUrl: envName + ".test.ai"
                };
            }
        default:
            console.log('***error: ' + 'infra selection unknown');
    };
}

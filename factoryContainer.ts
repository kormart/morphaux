import * as az_resources from "@pulumi/azure-native/resources";
import * as az_aci from "@pulumi/azure-native/containerinstance";
import * as gcp_cloudrun from "@pulumi/google-native/run/v2";
// import * as gcp_cloudrun from "@pulumi/gcp/cloudrun";
import * as rancher2 from "@pulumi/rancher2";
import { env } from 'process';

export const factoryContainer = (provider: string, envName: string) => {
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
    // const imageName = images[provider];
    switch(provider) {
        // case 'gcp':
        //     return async () => {
        //         const location='europe-west4';
        //         const helloService = new gcp_cloudrun.Service("hello", {
        //             location,
        //             template: {
        //                 spec: {
        //                     containers: [
        //                         { image: imageName,
        //                             ports: [{"containerPort": 8888}],
        //                             resources: {
        //                                 limits: {
        //                                     memory: "1Gi",
        //                                 },
        //                             } 
        //                         }
        //                     ],
        //                 },
        //             },
        //         });
        //         const iamHello = new gcp_cloudrun.IamMember("hello-everyone", {
        //             service: helloService.name,
        //             location,
        //             role: "roles/run.invoker",
        //             member: "allUsers",
        //         });
        //         return {
        //             envUrl: helloService.statuses[0].url
        //         };            
        //     }
        case 'azure':
            return async () => {
                const imageName = images['azure']
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
                    // envIp: containerGroup.ipAddress.ip,
                    envUrl: envName + ".westeurope.azurecontainer.io:8888/lab"
                };
            }
        case 'ice':
            return async () => {
                const imageName = images['ice']
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
            return async () => {} 
    };
}

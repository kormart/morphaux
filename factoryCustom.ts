const {JobServiceClient} = require('@google-cloud/aiplatform');

export function factoryCustom(provider, envName) {
    switch(provider) {
        case 'gcp':
            return async () => {
                const customJobDisplayName = 'test-custom-job';
                const modelDisplayName = 'test-model-out'
                const project = 'test-35178';
                const location = 'europe-west4';
                // Specifies the location of the api endpoint
                const clientOptions = {
                    apiEndpoint: 'europe-west4-aiplatform.googleapis.com',
                };
                
                // Instantiates a client
                const jobServiceClient = new JobServiceClient(clientOptions);
                
                async function createCustomJob() {
                    // Configure the parent resource
                    const parent = `projects/${project}/locations/${location}`;
                    const customJob = {
                    displayName: customJobDisplayName,
                    jobSpec: {
                        workerPoolSpecs: [
                        {
                            machineSpec: {
                            machineType: 'n1-standard-4',
                            acceleratorType: 'NVIDIA_TESLA_P4',
                            acceleratorCount: 1,
                            },
                            replicaCount: 1,
                            pythonPackageSpec: {
                            executorImageUri: 'europe-docker.pkg.dev/vertex-ai/training/tf-gpu.2-4:latest',
                            packageUris: [
                                'gs://vertex-test-colab/titanic/dist/trainer-0.1.tar.gz'
                            ],
                            pythonModule: 'trainer.task',
                            args: [
                                '--model_param_kernel=linear',
                                '--model_dir=gs://vertex-test-colab/titanic/trial',
                                '--data_format=csv',
                                '--training_data_uri=gs://vertex-test-colab/titanic.csv',
                                '--test_data_uri=gs://vertex-test-colab/titanic.csv',
                                '--validation_data_uri=gs://vertex-test-colab/titanic.csv'
                            ]
                            },
                        //   containerSpec: {
                        //     imageUri: containerImageUri,
                        //     command: [],
                        //     args: [],
                        //   },
                        },
                        ],
                    },
                    modelToUpload: {
                        displayName: modelDisplayName
                    }
                    };
                    const request = {parent, customJob};
                
                    // Create custom job request
                    const [response] = await jobServiceClient.createCustomJob(request);
                
                    console.log('Create custom job response:\n', JSON.stringify(response));
                }
                createCustomJob();
                
            }
    }
}

/**
 * TODO(developer): Uncomment these variables before running the sample.\
 * (Not necessary if passing values as arguments)
 */

const datasetId = "4187164578943074304";
const gcsSourceUri = "gs://cloud-ml-data/NL-classification/happiness.csv";
// eg. "gs://<your-gcs-bucket>/<import_source_path>/[file.csv/file.jsonl]"
const project = 'test-35178';
const location = 'europe-west4';

// Imports the Google Cloud Dataset Service Client library
const {DatasetServiceClient} = require('@google-cloud/aiplatform');

// Specifies the location of the api endpoint
const clientOptions = {
  apiEndpoint: 'europe-west4-aiplatform.googleapis.com',
};
const datasetServiceClient = new DatasetServiceClient(clientOptions);

async function importDataTextClassificationSingleLabel() {
  const name = datasetServiceClient.datasetPath(project, location, datasetId);
  // Here we use only one import config with one source
  const importConfigs = [
    {
      gcsSource: {uris: [gcsSourceUri]},
      importSchemaUri:
        'gs://google-cloud-aiplatform/schema/dataset/ioformat/text_classification_single_label_io_format_1.0.0.yaml',
    },
  ];
  const request = {
    name,
    importConfigs,
  };

  // Import data request
  const [response] = await datasetServiceClient.importData(request);
  console.log(`Long running operation : ${response.name}`);

  // Wait for operation to complete
  const [importDataResponse] = await response.promise();

  console.log(
    `Import data text classification single label response : \
      ${JSON.stringify(importDataResponse.result)}`
  );
}
importDataTextClassificationSingleLabel();
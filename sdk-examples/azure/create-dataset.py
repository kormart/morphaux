from azure.ai.ml import MLClient
from azure.identity import DefaultAzureCredential
from azure.ai.ml.entities import Data
from azure.ai.ml.constants import AssetTypes
import os

# enter details of your AML workspace
subscription_id = os.getenv("ARM_SUBSCRIPTION_ID")
resource_group = os.getenv("ARM_RG_ID")
workspace = os.getenv("ARM_MLWORKSPACE_ID")

print(subscription_id, resource_group, workspace)

# get a handle to the workspace
ml_client = MLClient(
    DefaultAzureCredential(), subscription_id, resource_group, workspace
)

try:
    registered_data_asset = ml_client.data.get(name="titanic", version="1")
    print("Found data asset. Will not create again")
except Exception as ex:
    my_data = Data(
        path="./sample_data/titanic.csv",
        type=AssetTypes.URI_FILE,
        description="Titanic Data",
        name="titanic",
        version="1",
    )
    ml_client.data.create_or_update(my_data)
    registered_data_asset = ml_client.data.get(name="titanic", version="1")
    print("Created data asset")
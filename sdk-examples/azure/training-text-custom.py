# this is old v1 stuff
# from azureml.core import Workspace, Environment
# from azureml.core import ScriptRunConfig
# from azureml.core import Experiment
# from azureml.core.dataset import Dataset
from azure.ai.ml import MLClient, command, Input
from azure.ai.ml.entities import Workspace, Environment, ComputeInstance, AmlCompute, Data
from azure.ai.ml.constants import AssetTypes
from azure.identity import DefaultAzureCredential
import os
import datetime

# enter details of your AML workspace
subscription_id = os.getenv("ARM_SUBSCRIPTION_ID")
resource_group = os.getenv("ARM_RG_ID")
workspace = os.getenv("ARM_MLWORKSPACE_ID")

print(subscription_id, resource_group, workspace)

# get a handle to the workspace
ml_client = MLClient(
    DefaultAzureCredential(), subscription_id, resource_group, workspace
)
ws = Workspace(
    name="my_workspace",
    location="northeurope",
    display_name="My workspace",
    description="This example shows how to create a workspace",
    tags=dict(purpose="demo"),
)
ml_client.workspaces.begin_create(ws)

# Compute Instances need to have a unique name across the region.
# Here we create a unique name with current datetime
ci_basic_name = "basic-ci" # + datetime.datetime.now().strftime("%Y%m%d%H%M")
ci_basic = ComputeInstance(name=ci_basic_name, size="STANDARD_DS3_v2")
ml_client.begin_create_or_update(ci_basic)

# cpu_cluster_name = "cpucluster"
# cluster_basic = AmlCompute(
#     name=cpu_cluster_name,
#     type="amlcompute",
#     size="STANDARD_DS3_v2",
#     max_instances=4
# )
# ml_client.begin_create_or_update(cluster_basic)

#myenv = Environment.from_conda_specification(name='sklearn-env', file_path='trainer/conda_dependencies.yml')
# following
# https://learn.microsoft.com/en-us/azure/machine-learning/v1/how-to-train-with-datasets

# data_path ='https://dprepdata.blob.core.windows.net/demo/Titanic.csv'
# my_data = Data(
#     path=data_path,
#     type=AssetTypes.URI_FILE,
#     description="<description>",
#     name="<name>",
#     version="<version>"
# )
# ml_client.data.create_or_update(my_data)

# specify aml compute name.
# cpu_compute_target = "cpu-cluster"
# try:
#     ml_client.compute.get(cpu_compute_target)
# except Exception:
#     print("Creating a new cpu compute target...")
#     compute = AmlCompute(
#         name=cpu_compute_target, size="STANDARD_D2_V2", min_instances=0, max_instances=1
#     )
#     ml_client.compute.begin_create_or_update(compute).result()
dependencies_dir = "./dependencies"
os.makedirs(dependencies_dir, exist_ok=True)

custom_env_name = "aml-scikit-learn"

job_env = Environment(
    name=custom_env_name,
    description="Custom environment for Credit Card Defaults pipeline",
    tags={"scikit-learn": "0.24.2"},
    conda_file=os.path.join(dependencies_dir, "conda.yml"),
    image="mcr.microsoft.com/azureml/openmpi3.1.2-ubuntu18.04:latest",
)
job_env = ml_client.environments.create_or_update(job_env)

print(
    f"Environment with name {job_env.name} is registered to workspace, the environment version is {job_env.version}"
)

train_src_dir = "./src"
os.makedirs(train_src_dir, exist_ok=True)

registered_model_name = "credit_defaults_model"
job = command(
    inputs=dict(kernel="linear", penalty=1.0),
    compute=ci_basic_name,
    environment=f"{job_env.name}:{job_env.version}",
    code="./src/",
    command="python train_iris.py --kernel ${{inputs.kernel}} --penalty ${{inputs.penalty}}",
    experiment_name="sklearn-iris-flowers",
    display_name="sklearn-classify-iris-flower-images",
)
ml_client.create_or_update(job)

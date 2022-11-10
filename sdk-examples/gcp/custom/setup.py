from setuptools import find_packages
from setuptools import setup

REQUIRED_PACKAGES = [
    'gcsfs==2022.5.0', 
    'dask[dataframe]==2022.2.0', 
    'google-cloud-bigquery==3.2.0',
    'google-cloud-bigquery-storage==2.13.2', 
    'six==1.16.0',
    'scikit-learn==1.0.1'
]
 
setup(
    name='trainer', 
    version='0.2', 
    install_requires=REQUIRED_PACKAGES,
    packages=find_packages(), # Automatically find packages within this directory or below.
    include_package_data=True, # if packages include any data files, those will be packed together.
    description='Classification training titanic survivors prediction model'
)
export REGION="europe-west4"
export PROJECT_ID="test-35178"
export BUCKET_NAME="vertex-test-colab"

# gsutil mb -l $REGION "gs://"$BUCKET_NAME

# pip install setuptools
# python3 setup.py install

# python3 -m trainer.task -v \
#     --model_param_kernel=linear \
#     --model_dir="gs://"$BUCKET_NAME"/titanic/trial" \
#     --data_format=csv \
#     --training_data_uri="gs://"$BUCKET_NAME"/titanic.csv" \
#     --test_data_uri="gs://"$BUCKET_NAME"/titanic.csv" \
#     --validation_data_uri="gs://"$BUCKET_NAME"/titanic.csv"

python3 setup.py sdist

gsutil cp dist/trainer-0.2.tar.gz "gs://"$BUCKET_NAME"/titanic/dist/trainer-0.1.tar.gz"

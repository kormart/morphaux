# Modified from https://www.geeksforgeeks.org/multiclass-classification-using-scikit-learn/
import os, logging, argparse, json
from typing import Union, List

# importing necessary libraries
import numpy as np
import pandas as pd
import dask.dataframe as dd
from sklearn import datasets
from sklearn.metrics import confusion_matrix
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import make_pipeline, Pipeline
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler, OneHotEncoder, OrdinalEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import classification_report, f1_score

# import joblib
# import mlflow
# import mlflow.sklearn

# List all column names for binary features: 0,1 or True,False or Male,Female etc
BINARY_FEATURES = [
    'sex']

# List all column names for numeric features
NUMERIC_FEATURES = [
    'age',
    'fare']

# List all column names for categorical features 
CATEGORICAL_FEATURES = [
    'pclass',
    'embarked',
    'home.dest',
    'parch',
    'sibsp']

ALL_COLUMNS = BINARY_FEATURES+NUMERIC_FEATURES+CATEGORICAL_FEATURES

# define the column name for label
LABEL = 'survived'

# Define the index position of each feature. This is needed for processing a 
# numpy array (instead of pandas) which has no column names.
BINARY_FEATURES_IDX = list(range(0,len(BINARY_FEATURES)))
NUMERIC_FEATURES_IDX = list(range(len(BINARY_FEATURES), len(BINARY_FEATURES)+len(NUMERIC_FEATURES)))
CATEGORICAL_FEATURES_IDX = list(range(len(BINARY_FEATURES+NUMERIC_FEATURES), len(ALL_COLUMNS)))


def clean_missing_numerics(df: pd.DataFrame, numeric_columns):
    '''
    removes invalid values in the numeric columns        

            Parameters:
                    df (pandas.DataFrame): The Pandas Dataframe to alter 
                    numeric_columns (List[str]): List of column names that are numberic from the DataFrame
            Returns:
                    pandas.DataFrame: a dataframe with the numeric columns fixed
    '''
    
    for n in numeric_columns:
        df[n] = pd.to_numeric(df[n], errors='coerce')
        
    df = df.fillna(df.mean())
         
    return df
    
def data_selection(df: pd.DataFrame, selected_columns: List[str], label_column: str) -> (pd.DataFrame, pd.Series):
    '''
    From a dataframe it creates a new dataframe with only selected columns and returns it.
    Additionally it splits the label column into a pandas Series.

            Parameters:
                    df (pandas.DataFrame): The Pandas Dataframe to drop columns and extract label
                    selected_columns (List[str]): List of strings with the selected columns. i,e ['col_1', 'col_2', ..., 'col_n' ]
                    label_column (str): The name of the label column

            Returns:
                    tuple(pandas.DataFrame, pandas.Series): Tuble with the new pandas DataFrame containing only selected columns and lablel pandas Series
    '''
    # We create a series with the prediciton label
    labels = df[label_column]
    
    data = df.loc[:, selected_columns]
    

    return data, labels


def pipeline_builder(params_svm: dict, bin_ftr_idx: List[int], num_ftr_idx: List[int], cat_ftr_idx: List[int]) -> Pipeline:
    '''
    Builds a sklearn pipeline with preprocessing and model configuration.
    Preprocessing steps are:
        * OrdinalEncoder - used for binary features
        * StandardScaler - used for numerical features
        * OneHotEncoder - used for categorical features
    Model used is SVC

            Parameters:
                    params_svm (dict): List of parameters for the sklearn.svm.SVC classifier 
                    bin_ftr_idx (List[str]): List of ints that mark the column indexes with binary columns. i.e [0, 2, ... , X ]
                    num_ftr_idx (List[str]): List of ints that mark the column indexes with numerica columns. i.e [6, 3, ... , X ]
                    cat_ftr_idx (List[str]): List of ints that mark the column indexes with categorical columns. i.e [5, 10, ... , X ]
                    label_column (str): The name of the label column

            Returns:
                     Pipeline: sklearn.pipelines.Pipeline with preprocessing and model training
    '''
        
    # Definining a preprocessing step for our pipeline. 
    # it specifies how the features are going to be transformed
    preprocessor = ColumnTransformer(
        transformers=[
            ('bin', OrdinalEncoder(), bin_ftr_idx),
            ('num', StandardScaler(), num_ftr_idx),
            ('cat', OneHotEncoder(handle_unknown='ignore'), cat_ftr_idx)], n_jobs=-1)


    # We now create a full pipeline, for preprocessing and training.
    # for training we selected a linear SVM classifier
    
    clf = SVC()
    clf.set_params(**params_svm)
    
    return Pipeline(steps=[ ('preprocessor', preprocessor),
                          ('classifier', clf)])

def train_pipeline(clf: Pipeline, X: Union[pd.DataFrame, np.ndarray], y: Union[pd.DataFrame, np.ndarray]) -> float:
    '''
    Trains a sklearn pipeline by fiting training data an labels and returns the accuracy f1 score
    
            Parameters:
                    clf (sklearn.pipelines.Pipeline): the Pipeline object to fit the data
                    X: (pd.DataFrame OR np.ndarray): Training vectors of shape n_samples x n_features, where n_samples is the number of samples and n_features is the number of features.
                    y: (pd.DataFrame OR np.ndarray): Labels of shape n_samples. Order should mathc Training Vectors X

            Returns:
                    score (float): Average F1 score from all cross validations
    '''
    # run cross validation to get training score. we can use this score to optimise training
    score = cross_val_score(clf, X, y, cv=10, n_jobs=-1).mean()
    
    # Now we fit all our data to the classifier. 
    clf.fit(X, y)
    
    return score

def prepare_report(cv_score: float, model_params: dict, classification_report: str, columns: List[str], example_data: np.ndarray) -> str:
    '''
    Prepares a training report in Text
    
            Parameters:
                    cv_score (float): score of the training job during cross validation of training data
                    model_params (dict): dictonary containing the parameters the model was trained with
                    classification_report (str): Model classification report with test data
                    columns (List[str]): List of columns that where used in training.
                    example_data (np.array): Sample of data (2-3 rows are enough). This is used to include what the prediciton payload should look like for the model
            Returns:
                    report (str): Full report in text
    '''
    
    buffer_example_data = '['
    for r in example_data:
        buffer_example_data+='['
        for c in r:
            if(isinstance(c,str)):
                buffer_example_data+="'"+c+"', "
            else:
                buffer_example_data+=str(c)+", "
        buffer_example_data= buffer_example_data[:-2]+"], \n"
    buffer_example_data= buffer_example_data[:-3]+"]"
        
    report = """
Training Job Report    
    
Cross Validation Score: {cv_score}

Training Model Parameters: {model_params}
    
Test Data Classification Report:
{classification_report}

Example of data array for prediciton:

Order of columns:
{columns}

Example for clf.predict()
{predict_example}


Example of GCP API request body:
{{
    "instances": {json_example}
}}

""".format(
    cv_score=cv_score,
    model_params=json.dumps(model_params),
    classification_report=classification_report,
    columns = columns,
    predict_example = buffer_example_data,
    json_example = json.dumps(example_data.tolist()))
    
    return report


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument('--kernel', type=str, default='linear',
                        help='Kernel type to be used in the algorithm')
    parser.add_argument('--penalty', type=float, default=1.0,
                        help='Penalty parameter of the error term')
    parser.add_argument("--data", type=str, help="path to input data")
    parser.add_argument('--model_param_degree',
        help = 'SVC model parameter- Degree. Only applies for poly kernel',
        type = int, default = 3
    )
    
    parser.add_argument('--model_param_C',
        help = 'SVC model parameter- C (regularization)',
        type = float, default = 1.0
    )
    
    parser.add_argument('--model_param_probability',
        help = 'Whether to enable probability estimates',
        type = bool, default = True
    )

    args = parser.parse_args()
    print(" ".join(f"{k}={v}" for k, v in vars(args).items()))

    print("input data:", args.data)
    
    df_train = dd.read_csv(args.data, dtype={'age': 'object','fare': 'object'}).compute()
    df_test = dd.read_csv(args.data, dtype={'age': 'object','fare': 'object'}).compute()
    df_valid = dd.read_csv(args.data, dtype={'age': 'object','fare': 'object'}).compute()

    with pd.option_context('display.max_rows', 10, 'display.max_columns', df_train.shape[1]):
        print(df_train)

    df_test = pd.concat([df_test,df_valid])

    logging.info('Defining model parameters')    
    model_params = dict()
    model_params['kernel'] = args.kernel
    model_params['degree'] = args.model_param_degree
    model_params['C'] = args.model_param_C
    model_params['probability'] = args.model_param_probability
    
    df_train = clean_missing_numerics(df_train, NUMERIC_FEATURES)
    df_test = clean_missing_numerics(df_test, NUMERIC_FEATURES)

    logging.info('Running feature selection')    
    X_train, y_train = data_selection(df_train, ALL_COLUMNS, LABEL)
    X_test, y_test = data_selection(df_test, ALL_COLUMNS, LABEL)

    # with pd.option_context('display.max_rows', 10, 'display.max_columns', X_train.shape[1]):
    #     print(X_train)

    logging.info('Training pipelines in CV')   
    clf = pipeline_builder(model_params, BINARY_FEATURES_IDX, NUMERIC_FEATURES_IDX, CATEGORICAL_FEATURES_IDX)

    cv_score = train_pipeline(clf, X_train, y_train)

    y_pred = clf.predict(X_test)
    test_score = f1_score(y_test, y_pred, average='weighted')
    logging.info('f1score: '+ str(test_score))    

    report = prepare_report(cv_score,
                        model_params,
                        classification_report(y_test,y_pred),
                        ALL_COLUMNS, 
                        X_test.to_numpy()[0:2])

    print(report)

    raise SystemExit(0)

    # TODO integrate the above with mlflow below

    # Start Logging
    mlflow.start_run()

    # enable autologging
    mlflow.sklearn.autolog()

    args = parser.parse_args()
    mlflow.log_param('Kernel type', str(args.kernel))
    mlflow.log_metric('Penalty', float(args.penalty))

    # loading the iris dataset
    # iris = datasets.load_iris()

    # X -> features, y -> label
    X = df.data
    y = df.target

    # dividing X, y into train and test data
    X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=0)

    # training a linear SVM classifier
    from sklearn.svm import SVC
    svm_model_linear = SVC(kernel=args.kernel, C=args.penalty)
    svm_model_linear = svm_model_linear.fit(X_train, y_train)
    svm_predictions = svm_model_linear.predict(X_test)

    # model accuracy for X_test
    accuracy = svm_model_linear.score(X_test, y_test)
    print('Accuracy of SVM classifier on test set: {:.2f}'.format(accuracy))
    mlflow.log_metric('Accuracy', float(accuracy))
    # creating a confusion matrix
    cm = confusion_matrix(y_test, svm_predictions)
    print(cm)

    registered_model_name="sklearn-iris-flower-classify-model"

    ##########################
    #<save and register model>
    ##########################
    # Registering the model to the workspace
    print("Registering the model via MLFlow")
    mlflow.sklearn.log_model(
        sk_model=svm_model_linear,
        registered_model_name=registered_model_name,
        artifact_path=registered_model_name
    )

    # # Saving the model to a file
    print("Saving the model via MLFlow")
    mlflow.sklearn.save_model(
        sk_model=svm_model_linear,
        path=os.path.join(registered_model_name, "trained_model"),
    )
    ###########################
    #</save and register model>
    ###########################
    mlflow.end_run()

if __name__ == '__main__':
    main()
import React, { Component } from 'react'
import {Switch,Route} from "react-router-dom";
import SignUp from './management/SignUp';
import Home from './management/Home';
import Account from './management/Account';
import LogIn from './management/LogIn';
import SuccessSignUp from './management/SuccessSignUp';

import Datasets from './datasets/Datasets';
import DatasetsTraining from './datasets/DatasetsTraining';
import DatasetDetails from './datasets/DatasetDetails';
import DatasetGenerate from './datasets/DatasetGenerate';
import DatasetUpload from './datasets/DatasetUpload';
import DatasetDownload from "./datasets/DatasetDownload";


import ObjectRemoved from './management/ObjectRemoved';
import ObjectDiscarded from './management/ObjectDiscarded';
import NoModel from './management/NoModel';


import Models from './models/Models';
import ModelDetails from './models/ModelDetails';
import ModelsDefineComparison from './models/ModelsDefineComparison';
import ModelsTypes from './models/ModelsTypes';
import ModelsComparisonFinished from './models/ModelsComparisonFinished';
import ModelsRecImg from './models/ModelsRecImg';
import TrainDNN from './models/TrainDNN';
import TrainRF from './models/TrainRF';
import TrainSVM from './models/TrainSVM';


import Tasks from './tasks/Tasks';
import TasksModels from './tasks/TasksModels';
import TasksDatasets from './tasks/TasksDatasets';



import RecImgTypes from './reconstruction_img/RecImgTypes';
import RecImgMeshesDatasets from './reconstruction_img/RecImgMeshesDatasets';
import RecImgReconstructed from './reconstruction_img/RecImgReconstructed';
import RecImgUploadVoltages from './reconstruction_img/RecImgUploadVoltages';
import RecImgPredictionMade from './reconstruction_img/RecImgPredictionMade';

//In this view the URLs of the application are defined.

class Routes extends Component{
    render(){
        return(
            <Switch>

                <Route  path="/rec_img_types" render={(props) => <RecImgTypes {...props}/>}/>
                <Route  path="/rec_img_meshes_datasets"  render={(props) => <RecImgMeshesDatasets {...props}/>} />
                <Route  path="/rec_img_reconstructed" render={(props) => <RecImgReconstructed {...props}/>}/>
                <Route  path="/rec_img_upload_voltages" render={(props) => <RecImgUploadVoltages {...props}/>}/>
                <Route  path="/rec_img_prediction_performed" render={(props) => <RecImgPredictionMade {...props}/>}/>


                <Route  path="/models/:id" render={(props) => <ModelDetails {...props}/>} />
                <Route  path="/models" render={(props) => <Models {...props}/>} />
                <Route  path="/models_rec_img" render={(props) => <ModelsRecImg {...props}/>} />
                <Route  path="/models_define_comparison" render={(props) => <ModelsDefineComparison {...props}/>}/>
                <Route  path="/models_comparison_performed" render={(props) => <ModelsComparisonFinished {...props}/>}/>


                <Route  path="/types_models" render={(props) => <ModelsTypes {...props}/>} />
                <Route  path="/train_dnn" render={(props) => <TrainDNN {...props}/>}/>
                <Route  path="/train_rf" render={(props) => <TrainRF {...props}/>}/>
                <Route  path="/train_svm" render={(props) => <TrainSVM {...props}/>}/>


                <Route  path="/datasets/:id" render={(props) => <DatasetDetails {...props}/>} />
                <Route  path="/datasets" render={(props) => <Datasets {...props}/>} />
                <Route  path="/datasets_training" render={(props) => <DatasetsTraining {...props}/>} />
                <Route  path="/dataset_generate" render={(props) => <DatasetGenerate {...props}/>} />
                <Route  path="/dataset_upload" render={(props) => <DatasetUpload {...props}/>} />
                <Route  path="/dataset_download/:id" render={(props) => <DatasetDownload {...props}/>} />
                
                {/* <Route  path="/signup" component = {Registro}/> */}
                <Route  path="/signup" render={(props) => <SignUp {...props}/>}/>
                <Route  path="/success_signup" render={(props) => <SuccessSignUp {...props}/>} />
                <Route  path="/home" render={(props) => <Home {...props}/>}/>
                <Route  path="/account" render={(props) => <Account {...props}/>}/>


                <Route  path="/object_removed" render={(props) => <ObjectRemoved {...props}/>}/>
                <Route  path="/object_discarded" render={(props) => <ObjectDiscarded {...props}/>}/>
                <Route  path="/without_model" render={(props) => <NoModel {...props}/>}/>


                <Route  path="/tasks" render={(props) => <Tasks {...props}/>} />
                <Route  path="/tasks_models" render={(props) => <TasksModels {...props}/>} />
                <Route  path="/tasks_datasets" render={(props) => <TasksDatasets {...props}/>} />

                <Route  path="/" exact component = {LogIn}/>





             </Switch>
        );
    }
}

export default Routes;
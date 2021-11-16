import React, { Component } from 'react'
import Header from '../management/Header';
import GoBackButton from '../management/GoBackButton';
import NoSession from '../management/NoSession'
import {Redirect} from "react-router-dom";


class Tasks extends Component{
    //View in which the user is shown the two types of system tasks:
    //-Training of models
    //-Upload/Generation of a dataset

    constructor(props){
        
        super(props);
        this.state = {
            toTasksModels: false,
            toTasksDatasets: false,
            help_message: <p>The system has a task queue. The task queue contains two types of tasks: model training 
                            and dataset generation/upload.</p>
          }
    }

    access_tasks_models(){
        this.setState({toTasksModels: true});
    }

    access_tasks_datasets(){
        this.setState({toTasksDatasets: true});
    }


    render(){
        
        
        if (this.state.toTasksModels === true) {
            return <Redirect push to={{
                pathname: '/tasks_models',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }


        if (this.state.toTasksDatasets === true) {
            return <Redirect push to={{
                pathname: '/tasks_datasets',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }


        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Header with_account = {true} help_message = {this.state.help_message} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <GoBackButton/>
        
                        <br/>
                        <br/>
        
                        <h5 className = "text-center" > Select the type of tasks you wish to consult: </h5>
                        <br/>
                        <div className="container" >
                            <div className="row" >
                                <div className="card col-md-5 caja width_14" >
                                    <div className="card-body text-center">
                                        <h5 className="card-title"> <b>Model training</b></h5>
                                        <p> In this section you will be shown all the model trainings that are in progress, as well as the trainings that have already finished.</p>
                                        <button className="btn btn-dark" onClick = {() => this.access_tasks_models()}>Access</button>
                                    </div>
                                </div>
                                <div className="col-md-2 width_14"></div>
                                <div className="card col-md-5 caja width_14">
                                    <div className="card-body text-center">
                                        <h5 className="card-title"> <b>Upload and generation of datasets </b></h5>
                                        <p> 
In this section you will be able to visualize which datasets are being generated or uploaded to the system, as well as the datasets that have already been uploaded or generated.</p>
                                        <button className="btn btn-dark" onClick = {() => this.access_tasks_datasets()}>Access</button>
                                    </div>
                                </div>
        
                            </div>
                        </div>
                    </div>
                ):(
                    <NoSession/>
                )}

            </div>
        );
    }
}

export default Tasks;
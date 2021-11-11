import React, { Component } from 'react'
import Header from './Header';
import NoSession from './NoSession'
import {Redirect} from "react-router-dom";

class ObjectDiscarded extends Component{
    //View that is displayed when a user discards a trained model or an uploaded/generated dataset.
    
    constructor(props){
        super(props);
        this.state = {
            toTrainings: false,
            toTasksDatasets: false,
            help_message: <p></p>,
          }
    }


    componentDidMount(){
        var message_aux;
        if(this.props.location.state.type_object === "model"){
            message_aux = <p> The discarded model is no longer in the system.</p>;
        }else{
            message_aux = <p> The discarded dataset is no longer in the system. </p>
        }
        this.setState({help_message: message_aux});
    }

    

    access_trainings(){
        this.setState({toTrainings: true});
    }

    access_tasks_datasets(){
        this.setState({toTasksDatasets: true});
    }


    render(){

        if (this.state.toTrainings === true) {
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
                        <Header con_cuenta = {true} help_message = {this.state.help_message} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                            {this.props.location.state.type_object === "model" ? (
                                <div className="card bg-light mx-auto mb-3 caja max_width_50">
                                    <div className="card-header">Model discarded</div>
                                    <div className="card-body">
                                        <h5 className="card-title margin_bottom_2">Model with ID {this.props.location.state.id} has been discarded.</h5>
                                        <div className = "text-center">
                                            <span className="btn btn-dark mb-2 my-auto text-center width_15"  onClick ={() => this.access_trainings()}>
                                                Back to training list
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ):(
                                <div className="card bg-light mx-auto mb-3 caja max_width_50" >
                                    <div className="card-header">Dataset discarded</div>
                                    <div className="card-body">
                                        <h5 className="card-title margin_bottom_2">Dataset with ID {this.props.location.state.id} has been discarded.</h5>
                                        <div className = "text-center">
                                            <span className="btn btn-dark mb-2 my-auto text-center width_15"  onClick ={() => this.access_tasks_datasets()}>
                                                Back to dataset task list
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
        
                    </div>
                ):(
                    <NoSession/>
                )}

            </div>
        );
    }
}

export default ObjectDiscarded;
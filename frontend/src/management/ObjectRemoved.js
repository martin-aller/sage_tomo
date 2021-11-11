import React, { Component } from 'react'
import Header from './Header';
import NoSession from './NoSession'
import {Redirect} from "react-router-dom";

class ObjectRemoved extends Component{
    //View shown to the user after deleting a dataset or a model.
    
    constructor(props){
        super(props);
        this.state = {
            toModels: false,
            toDatasets: false,
            help_message: <p></p>
          }

    }

    componentDidMount(){
        var message_aux;
        if(this.props.location.state.type_object === "model"){
            message_aux = <p> The deleted model is no longer in the system, so you will not be able to use it again.</p>;
        }else{
            message_aux = <p> The deleted dataset is no longer in the system, so you will not be able to use it again. </p>
        }
        this.setState({help_message: message_aux});
    }


    access_models(){
        this.setState({toModels: true});
    }

    
    access_datasets(){
        this.setState({toDatasets: true});
    }


    render(){

        if (this.state.toModels === true) {
            return <Redirect push to={{
                pathname: '/models',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }


        if (this.state.toDatasets === true) {
            return <Redirect push to={{
                pathname: '/datasets',
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
                                    <div className="card-header">Model removed</div>
                                    <div className="card-body">
                                        <h5 className="card-title margin_bottom_2">Model {this.props.location.state.id} has been removed successfully</h5>
                                        <div className = "text-center">
                                            <span className="btn btn-dark mb-2 my-auto text-center width_15"  onClick ={() => this.access_models()}>
                                                Back to the list of models
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ):(
                                <div className="card bg-light mx-auto mb-3 caja max_width_50" >
                                    <div className="card-header">Dataset removed</div>
                                    <div className="card-body">
                                        <h5 className="card-title margin_bottom_2">Dataset {this.props.location.state.id} has been removed successfully.</h5>
                                        <div className = "text-center">
                                            <span className="btn btn-dark mb-2 my-auto text-center width_15"  onClick ={() => this.access_datasets()}>
                                                Back to the list of datasets
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

export default ObjectRemoved;
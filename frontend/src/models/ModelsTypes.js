import React, { Component } from 'react'
import Header from '../management/Header';
import GoBackButton from '../management/GoBackButton';
import NoSession from '../management/NoSession'
import {Redirect} from "react-router-dom";

class ModelsTypes extends Component{
    //View of the different types of models that exist in the system.
    //This view is accessed when a new model is to be trained.
    
    constructor(props){
        super(props);
        this.state = {
            toDNN: false,
            toRF: false,
            toSVM: false,
            help_message: <p>The system allows training three different types of models: neural networks (DNN), random forest (RF) and support vector machines (SVM). Select one of the types and you will be able 
                            to define the specific parameters to train a model of the chosen type.</p>

          }
    }


    render(){
        
        if (this.state.toDNN === true) {
            return <Redirect push to={{
                pathname: '/train_dnn',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>
        }

        if (this.state.toRF === true) {
            return <Redirect push to={{
                pathname: '/train_rf',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>
        }

        if (this.state.toSVM === true) {
            return <Redirect push to={{
                pathname: '/train_svm',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>
        }

        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Header with_account = {true} help_message = {this.state.help_message} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <GoBackButton/>
        
                        <h5 className = "text-center" > Select the type of model you want to train : </h5>
                        <br/>
                        <div className="container" >
                            <div className="row" >
                                <div className="card col-md-4 caja padding_top_1">
                                    <div className="card-body d-flex flex-column text-center ">
                                        <h5 className="card-title"> <b>Neural Network</b> </h5>
                                        <img  className = "rounded mx-auto d-block margin_bottom_1" src={process.env.PUBLIC_URL + '/images/dnn.png'} alt="neural_network"/>
                                        <span className ="mt-auto"><span className="btn btn-dark" onClick = {() => this.setState({toDNN: true})}>Access</span></span>
                                    </div>
                                </div>
        
                                <div className="card col-md-4 caja padding_top_1">
                                    <div className="card-body d-flex flex-column text-center ">
                                        <h5 className="card-title"> <b>Random Forest</b> </h5>
                                        <img  className = "rounded mx-auto d-block margin_bottom_1" src={process.env.PUBLIC_URL + '/images/rf.png'}
                                        width = "65%" height = "65%" alt="random_forest"/>
                                        <span className ="mt-auto"><span className="btn btn-dark" onClick = {() => this.setState({toRF: true})} >Access</span></span>
                                    </div>
                                </div>
        
                                <div className="card col-md-4 caja padding_top_1">
                                    <div className="card-body d-flex flex-column text-center">
                                        <h5 className="card-title"> <b>Support Vector Machine </b></h5>
                                        <img  className = "rounded mx-auto d-block margin_bottom_1" src={process.env.PUBLIC_URL + '/images/svm.png'} 
                                        width = "80%" height = "80%" alt="svm"/>
                                        <span className ="mt-auto"><p className="btn btn-dark" onClick = {() => this.setState({toSVM: true})} >Access</p></span>
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

export default ModelsTypes;
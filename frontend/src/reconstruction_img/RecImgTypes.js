import React, { Component } from 'react'
import Header from '../management/Header';
import GoBackButton from '../management/GoBackButton';
import NoSession from '../management/NoSession'
import {Redirect} from "react-router-dom";

class RecImgTypes extends Component{
    //The two types of operations are: reconstruction of the images (real and predicted) 
    //of the mesh from a dataset and prediction of conductivities from a voltages file.

    constructor(props){
        super(props);
        this.state = {
            toMeshesDatasets: false,
            toConductivitiesPrediction: false,
            help_message: <p>With the model selected in the previous window, you can perform two types of actions. On the one hand, 
                you can reconstruct meshes belonging to datasets stored in the system. On the other hand, you can perform conductivity 
                predictions for a set of voltages you supply in CSV format. </p>

          }
    }



    render(){
        
        if (this.state.toMeshesDatasets === true) {
            return <Redirect push to={{
                pathname: '/rec_img_meshes_datasets',
                state: { id_model: this.props.location.state.id_model, token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>
        }

        if (this.state.toConductivitiesPrediction === true) {
            return <Redirect push to={{
                pathname: '/rec_img_subir_voltages',
                state: { error_structure: false,
                         id_model: this.props.location.state.id_model, token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>
        }



        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Header con_cuenta = {true} help_message = {this.state.help_message} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <GoBackButton/>
        
                        <h5 className = "text-center" > Select what to do: </h5>
                        <br/>
                        <div className="container" >
                            <div className="row" >
                                <div className="card col-md-5 caja width_14">
                                    <div className="card-body text-center">
                                        <h5 className="card-title"> <b>Analyze meshes from datasets</b> </h5>                
                                        <p className="card-text">
                                            Reconstruct the images of meshes from the available datasets and compare the reconstructions with the real images.
                                        </p>
        
                                        <span className="btn btn-dark" onClick = {() => this.setState({toMeshesDatasets:true})}>Access</span>
                                    </div>
                                </div>
                                <div className="col-md-2 width_14" >
        
                                </div>
                                <div className="card col-md-5 caja width_14">
                                    <div className="card-body text-center">
                                        <h5 className="card-title"> <b>Predictions from a file of voltages</b> </h5>
                                        <p className="card-text">
                                            Upload a file of voltages to the system, predict the associated conductivity values and reconstruct the images.
                                        </p>
                                        <span className="btn btn-dark" onClick = {() => this.setState({toConductivitiesPrediction:true})}>Access</span>
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

export default RecImgTypes;
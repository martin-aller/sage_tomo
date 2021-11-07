import React, { Component } from 'react'
import Cabecera from '../gestion/Cabecera';
import BotonAtras from '../gestion/BotonAtras';
import SinSesion from '../gestion/SinSesion'
import {Redirect} from "react-router-dom";

class RecImgTipos extends Component{
    //Vista en la que se le muestran al usuario los dos tipos de operaciones de reconstrucción
    //Los dos tipos de operaciones son: reconstrucción de las imágenes (real y predicha) de
    //la malla de un dataset y predicción de conductividades a partir de un fichero de voltajes.
    constructor(props){
        super(props);
        this.state = {
            aMallasDatasets: false,
            aPrediccionConductividades: false,
            mensaje_ayuda: <p>With the model selected in the previous window, you can perform two types of actions. On the one hand, 
                you can reconstruct meshes belonging to datasets stored in the system. On the other hand, you can perform conductivity 
                predictions for a set of voltages you supply in CSV format. </p>

          }
    }



    render(){
        console.log("Se ejecuta RecImg")
        if (this.state.aMallasDatasets === true) {
            return <Redirect push to={{
                pathname: '/rec_img_mallas_datasets',
                state: { id_modelo: this.props.location.state.id_modelo, token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>
        }

        if (this.state.aPrediccionConductividades === true) {
            console.log("Esto que")
            return <Redirect push to={{
                pathname: '/rec_img_subir_voltajes',
                state: { error_estructura: false,
                         id_modelo: this.props.location.state.id_modelo, token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>
        }



        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Cabecera con_cuenta = {true} mensaje_ayuda = {this.state.mensaje_ayuda} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <BotonAtras/>
        
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
        
                                        <span className="btn btn-dark" onClick = {() => this.setState({aMallasDatasets:true})}>Access</span>
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
                                        <span className="btn btn-dark" onClick = {() => this.setState({aPrediccionConductividades:true})}>Access</span>
                                    </div>
                                </div>
        
                            </div>
                        </div>
        
                    </div>
                ):(
                    <SinSesion/>
                )}

            </div>
        );
    }
}

export default RecImgTipos;
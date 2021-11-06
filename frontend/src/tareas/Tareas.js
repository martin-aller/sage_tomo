import React, { Component } from 'react'
import Cabecera from '../gestion/Cabecera';
import BotonAtras from '../gestion/BotonAtras';
import SinSesion from '../gestion/SinSesion'
import {Redirect} from "react-router-dom";


class Tareas extends Component{
    //Vista en la que se le muestra al usuario los dos tipos de tareas del sistema:
    //-Entrenamiento de modelos
    //-Subida/Generación del dataset

    constructor(props){
        console.log("Llega al constructor");
        super(props);
        this.state = {
            aTareasModelos: false,
            aTareasDatasets: false,
            mensaje_ayuda: <p>El sistema dispone de una cola de tareas. La cola de tareas contiene tareas de dos tipos: entrenamientos y generación/subida de
                              datasets.</p>
          }
    }

    acceder_tareas_modelos(){
        this.setState({aTareasModelos: true});
    }

    acceder_tareas_datasets(){
        this.setState({aTareasDatasets: true});
    }


    render(){
        console.log("Se ejecuta Tareas Tipos");
        
        if (this.state.aTareasModelos === true) {
            return <Redirect push to={{
                pathname: '/tareas_modelos',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }


        if (this.state.aTareasDatasets === true) {
            return <Redirect push to={{
                pathname: '/tareas_datasets',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }


        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Cabecera con_cuenta = {true} mensaje_ayuda = {this.state.mensaje_ayuda} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <BotonAtras/>
        
                        <br/>
                        <br/>
        
                        <h5 className = "text-center" > Select the type of tasks you wish to consult: </h5>
                        <br/>
                        <div className="container" >
                            <div className="row" >
                                <div className="card col-md-5 caja width_14" >
                                    <div className="card-body text-center">
                                        <h5 className="card-title"> Model training</h5>
                                        <p> In this section you will be shown all the model trainings that are in progress, as well as the trainings that have already finished.</p>
                                        <button className="btn btn-dark" onClick = {() => this.acceder_tareas_modelos()}>Access</button>
                                    </div>
                                </div>
                                <div className="col-md-2 width_14"></div>
                                <div className="card col-md-5 caja width_14">
                                    <div className="card-body text-center">
                                        <h5 className="card-title"> Upload and generation of datasets </h5>
                                        <p> 
In this section you will be able to visualize which datasets are being generated or uploaded to the system, as well as the datasets that have already been uploaded or generated.</p>
                                        <button className="btn btn-dark" onClick = {() => this.acceder_tareas_datasets()}>Access</button>
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

export default Tareas;
import React, { Component } from 'react'
import Cabecera from './Cabecera';
import SinSesion from './SinSesion'
import {Redirect} from "react-router-dom";

class ObjetoDescartado extends Component{
    //Vista que se muestra cuando un usuario descarta un modelo entrenado o
    //un dataset subido/generado.
    
    constructor(props){
        super(props);
        this.state = {
            aEntrenamientos: false,
            aTareasDatasets: false,
            mensaje_ayuda: <p></p>,
          }

    }

    componentDidMount(){
        var mensaje_aux;
        if(this.props.location.state.tipo_objeto === "modelo"){
            mensaje_aux = <p> The discarded model is no longer in the system.</p>;
        }else{
            mensaje_aux = <p> The discarded dataset is no longer in the system. </p>
        }
        this.setState({mensaje_ayuda: mensaje_aux});
    }

    

    acceder_entrenamientos(){
        this.setState({aEntrenamientos: true});
    }

    acceder_tareas_datasets(){
        this.setState({aTareasDatasets: true});
    }

    render(){

        if (this.state.aEntrenamientos === true) {
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
                            {this.props.location.state.tipo_objeto === "modelo" ? (
                                <div className="card bg-light mx-auto mb-3 caja max_width_50">
                                    <div className="card-header">Model discarded</div>
                                    <div className="card-body">
                                        <h5 className="card-title margin_bottom_2">Model with ID {this.props.location.state.id} has been discarded.</h5>
                                        <div className = "text-center">
                                            <span className="btn btn-dark mb-2 my-auto text-center width_15"  onClick ={() => this.acceder_entrenamientos()}>
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
                                            <span className="btn btn-dark mb-2 my-auto text-center width_15"  onClick ={() => this.acceder_tareas_datasets()}>
                                                Back to dataset task list
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
        
        
                    </div>
                ):(
                    <SinSesion/>
                )}

            </div>
        );
    }
}

export default ObjetoDescartado;
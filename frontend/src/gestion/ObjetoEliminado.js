import React, { Component } from 'react'
import Cabecera from './Cabecera';
import SinSesion from './SinSesion'
import {Redirect} from "react-router-dom";

class ObjetoEliminado extends Component{
    //Vista que se muestra al usuario cuando eliminar un dataset o un modelo.
    
    constructor(props){
        super(props);
        this.state = {
            aModelos: false,
            aDatasets: false,
            mensaje_ayuda: <p></p>
          }

    }

    componentDidMount(){
        var mensaje_aux;
        if(this.props.location.state.tipo_objeto === "modelo"){
            mensaje_aux = <p> The deleted model is no longer in the system, so you will not be able to use it again.</p>;
        }else{
            mensaje_aux = <p> The deleted dataset is no longer in the system, so you will not be able to use it again. </p>
        }
        this.setState({mensaje_ayuda: mensaje_aux});
    }

    acceder_modelos(){
        this.setState({aModelos: true});
    }

    acceder_datasets(){
        this.setState({aDatasets: true});
    }


    render(){

        if (this.state.aModelos === true) {
            return <Redirect push to={{
                pathname: '/modelos',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }


        if (this.state.aDatasets === true) {
            return <Redirect push to={{
                pathname: '/datasets',
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
                                    <div className="card-header">Model removed</div>
                                    <div className="card-body">
                                        <h5 className="card-title margin_bottom_2">Model {this.props.location.state.id} has been removed successfully</h5>
                                        <div className = "text-center">
                                            <span className="btn btn-dark mb-2 my-auto text-center width_15"  onClick ={() => this.acceder_modelos()}>
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
                                            <span className="btn btn-dark mb-2 my-auto text-center width_15"  onClick ={() => this.acceder_datasets()}>
                                                Back to the list of datasets
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

export default ObjetoEliminado;
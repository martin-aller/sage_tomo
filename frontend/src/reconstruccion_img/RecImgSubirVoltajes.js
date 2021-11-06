import React, { Component } from 'react'
import Cabecera from '../gestion/Cabecera';
import BotonAtras from '../gestion/BotonAtras';
import SinSesion from '../gestion/SinSesion'
import {Redirect} from "react-router-dom";


class RecImgSubirVoltajes extends Component{
    //Vista con un formulario para que el usuario suba un fichero con voltajes a partir
    //de los cuales realizar predicciones de las conductividades.
    
    constructor(props){
        super(props);
        this.state = {
            aPrediccionRealizada: false,
            error_estructura: false,
            error_seleccion: false,
            fichero: null,
            mensaje_ayuda: <p>En esta ventana puedes subir un archivo en formato CSV que contenga un conjunto de voltajes. En cada línea, deberá contener los
                            voltajes asociados a una malla, separados por punto y coma. En caso de que no tenga el formato incorrecto, se mostrará
                            un error.</p>

        }
        this.handleChangeFichero = this.handleChangeFichero.bind(this);

    }

    componentDidMount(){
        this.setState({error_estructura: this.props.location.state.error_estructura})
    }

    handleChangeFichero(e){
        console.log("Handle fichero");
        this.setState({fichero: e.target.files[0]});
    }

    acceder_prediccion_realizada(){
        this.setState({error_seleccion: false, error_estructura:false});
        if(this.state.fichero === null){
            this.setState({error_seleccion: true});
        }else{
            this.setState({aPrediccionRealizada: true});
        }
    }



    render(){

        console.log("PREDECIR VOLTAJES");
        if (this.state.aPrediccionRealizada === true) {
            return <Redirect push to={{
                pathname: "/rec_img_prediccion_realizada",
                state: { fichero: this.state.fichero, id_modelo: this.props.location.state.id_modelo, token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>
        }


        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Cabecera con_cuenta = {true} mensaje_ayuda = {this.state.mensaje_ayuda} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <BotonAtras/>
                        <div className = "container">
                            <div className="card caja">
                                <div className="card-body" >
                                    <h5 className="card-title">Upload file of voltages</h5>
                                    <div className = "row"  >
                                        <div className="col-md-12">
                                                <div className="form-group row">
                                                    <label className="col-sm-6 col-form-label"> Select the dataset you want to upload: </label>
                                                    <div className="col-sm-3">
                                                        <input type="file" className="form-control-file seleccionado" onChange={this.handleChangeFichero} /> 
                                                    </div>
                                                    <div className="col-sm-3">
                                                        <p id = "label_seleccionado" hidden> Selected file: </p>
                                                        <p id= "fichero_seleccionado"></p>
                                                    </div>
        
                                                </div>
        
                                                {this.state.error_estructura === true &&
                                                    <div className="alert alert-danger" role="alert" id = "estructura_incorrecta">
                                                        El formato o la estructura del fichero seleccionado es incorrecta.
                                                    </div>
                                                }
                                                {this.state.error_seleccion === true &&
                                                    <div className="alert alert-danger row" role="alert" id = "mensaje_informativo" >
                                                        No has seleccionado ningún fichero.
                                                    </div>
                                                }
        
                                
                                            <hr/>
                                            <br/>
                                            <br/>
        
        
                                            <div className="form-group row text-center">
                                                <div className = "col-md-12">
                                                    <input type="button"  className="btn-lg btn-dark  mb-2" onClick={() => this.acceder_prediccion_realizada()} id = "btn_predecir" value = "Make predictions"/> 
                                                        
                                                </div>
                                            </div>
                                        </div>
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

export default RecImgSubirVoltajes;
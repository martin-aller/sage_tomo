import React, { Component } from 'react'
import Cabecera from '../gestion/Cabecera';
import BotonAtras from '../gestion/BotonAtras';
import SinSesion from '../gestion/SinSesion'
import ModalSiNo from '../gestion/ModalSiNo';

import axios from 'axios';
import {Redirect} from "react-router-dom";



class ModelosRecImg extends Component{
    //Lista de modelos que se muestra al usuario para que seleccione uno de ellos
    //con el propósito de utilizar dicho modelo para reconstruir una imagen.
    constructor(props){
        console.log("Llega al constructor");
        super(props);
        this.state = {
            lista_modelos: [],
            cargando: true,
            id_detalles: null,
            id_seleccionado: null,
            error_seleccion: false,
            mensaje_ayuda: <p>In order to reconstruct images, you must select a model. The models you can select are those you have trained 
                            yourself or public models trained by other users.</p>,

          }
    }



    componentDidMount(){
        this.get_modelos();
    }

    get_modelos(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        axios.get(this.props.location.state.url_base + "api_tomo/modelos/", config)
        .then(
            response => {
                console.log("Obtener modelos.");
                this.setState({lista_modelos: response.data, cargando: false});
                console.log(response.data);
                //console.log(response.data[0].creador.username);
                //console.log("CREADOR: ", response.data[1])

            })
        .catch(error => {
            //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
            console.error('Se ha producido un error.', error);
        });
    }






    ver_detalles_modelo(id){
        console.log("Función detalles.")
        this.setState({id_detalles : id});
    }






    obtiene_mse(modelo){
        for(var i = 0; i < modelo.metricas.length; i++){
            var m = modelo.metricas[i];
            if ( m.nombre_metrica === "mse"){
                return this.redondea_num(m.valor_metrica);
            }
        }
        return null;
    }




    redondea_num(num){
        return Math.round((num + Number.EPSILON) * 100) / 100; //Number.Epsilon para números como 1.005
    }

    seleccionar_modelo(){
        var grupo = document.getElementsByName('lista_modelos');
        var modelo = null;

        this.setState({error_seleccion:false});
        
        for (var i=0; i<grupo.length; i++) {
            if (grupo[i].type == 'radio' && grupo[i].checked) {
                console.log("Valor: ",grupo[i].value);
                modelo = grupo[i].value;
                break;
            }
        }
        
        if(modelo === null){
            this.setState({error_seleccion:true});
        }else{
            console.log("Llega aquí.");
            this.setState({id_seleccionado:modelo});
        }
        
    }



    render(){
        console.log("Se ejecuta modelos");
        if (this.state.id_detalles !== null) {
            return <Redirect push to={{
                pathname: '/modelos/' + this.state.id_detalles,
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }


        if (this.state.id_seleccionado !== null) {
            return <Redirect push to={{
                pathname: "/rec_img_tipos",
                state: { id_modelo: this.state.id_seleccionado, 
                         token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>
        }


        
        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Cabecera con_cuenta = {true} mensaje_ayuda = {this.state.mensaje_ayuda} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <BotonAtras/>
        
        
                        <div className="container card caja">
                                    <div className="card-body ">
                                        <h3 className="card-title titulo"> <b>Reconstruction of images</b> </h3>
                                        <h5 className="card-title"><b>Model selection</b></h5>
                                        <p className="card-text">Select a model to make the predictions for the reconstruction of images:</p>
        
                                        <div> {this.state.lista_modelos.length > 0 ? (
                                            <form method= "post" action="{% url 'tomo:seleccionar_comparacion' %}">
                                                    <div className="row" >
                                                        <div className="col-md-12 width_14">
                                                                {this.state.cargando === true ? (
                                                                    <div className="row" id = "cargar">
                                                                        <div className = "col text-center">
                                                                            <div className="spinner-border text-dark cargador" role="status">
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ):(
                                                                    <table className = "table table-striped tabla_scroll_y_20 tabla_scroll_x">
                                                                        <thead>
                                                                        <tr>
                                                                            <th scope="col" className = "ancho_col"></th>
            
                                                                            <th scope="col" className = "ancho_col">Id </th>
                                                                            <th scope="col" className = "ancho_col">Type </th>
                                                                            <th scope="col" className = "ancho_col">Dataset</th>
                                                                            <th scope="col" className = "ancho_col">MSE </th>
                                                                            <th scope="col" className = "ancho_col">Additional comments </th>
                                                                            <th scope="col" className = "ancho_col">Creator </th>
                                                                            <th scope="col" className = "ancho_col"></th>
            
                                                                        </tr>
            
                                                                        </thead>
                                                                        <tbody>
                                                                            {this.state.lista_modelos.map( (modelo) => 
                                                                            <tr key = {modelo.id}>
                                                                                    <td><input type="radio" name = "lista_modelos" value = {modelo.id}/></td>
            
                                                                                    <th scope="row">{modelo.id}</th>
                                                                                    <td>{modelo.tipo}</td>
                                                                                    <td>{modelo.dataset}</td>
                                                                                    <td>
                                                                                        {this.obtiene_mse(modelo)}
                                                                                    </td>
            
            
                                                                                    <td>{modelo.comentarios_adicionales}</td>
                                                                                    <td>{modelo.creador.username}</td>
                                                                                    <td> <span className = "btn-link cursor_puntero" onClick = {() => this.ver_detalles_modelo(modelo.id)}> View details</span> </td>
                                                                        
            
                                                                        
                                                                                </tr>
                                                                            )}
            
                                                                        </tbody>
                                                                    </table>
            
                                                                )}
            
            
                                                                {this.state.error_seleccion && 
                                                                    <div className = "row text-center margin_top_2">
                                                                        <div className = "col-md-3"></div>
                                                                        <div className="col-md-6">
                                                                            <div className="alert alert-danger">
                                                                                <p>Debes seleccionar un modelo.</p>
                                                                            </div>                                
                                                                        </div>
                                                                        <div className = "col-md-3"></div>
                                                                    </div>
                                                                }
            
                                                        </div>
                                                    </div>
                                            </form>
                                        ):(
                                            <div className = "row text-center">
                                                        <div className = "col-sm-2"></div>
                                                        <p className = "col-sm-8 alert alert-primary sin_elementos"  role = "alert"> 
                                                        There are currently no models stored in the system.
                                                        </p>
                                                        <div className = "col-sm-2"></div>
                                            </div>
                                        )}
                                        </div>

                                        
        
        
                                    </div>
                        </div>
        
                            <div className = "row text-center margin_top_2">
                                {this.state.lista_modelos.length > 0 ? (
                                    <div className="col-md-12">
                                        <input type="button" className="btn-lg btn-dark  mb-2" id = "btn_dataset" value= "Select model" onClick = {() => this.seleccionar_modelo()}/>
                                    </div>
                                ):(
                                    <div></div>
                                )}

                            </div>                 
        
                    </div>
                ):(
                    <SinSesion/>
                )}

            </div>
        );
    }
}

export default ModelosRecImg;
import React, { Component } from 'react'
import Cabecera from '../gestion/Cabecera';
import BotonAtras from '../gestion/BotonAtras';
import ModalSiNo from '../gestion/ModalSiNo';
import SinSesion from '../gestion/SinSesion'
import axios from 'axios';
import {Redirect} from "react-router-dom";



class DatasetsEntrenamiento extends Component{
    //Vista con el listado de datasets utilizada para seleccionar el dataset
    //con el que se quiere entrenar un modelo. A esta vista se accede desde la vista
    //de definición de parámetros de un modelo.
    
    constructor(props){
        console.log("Llega al constructor");
        super(props);
        this.state = {
            lista_datasets: [],
            cargando: true,
            id_detalles: null,
            id_seleccionado: null,
            error_seleccion: false,

          }

    }

    componentDidMount(){
        this.get_datasets();
    }

    get_datasets(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        axios.get(this.props.location.state.url_base + "api_tomo/datasets/", config)
        .then(
            response => {
                console.log("Obtener datasets.");
                this.setState({lista_datasets: response.data, cargando: false});
                console.log(response.data);
                //console.log(response.data[0].creador.username);
                //console.log("CREADOR: ", response.data[1])

            })
        .catch(error => {
            //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
            console.error('Se ha producido un error.', error);
        });
    }

    ver_detalles_dataset(id){
        this.setState({id_detalles : id});
    }


    seleccionar_dataset(){
        var grupo = document.getElementsByName('lista_datasets');
        var dataset = null;

        this.setState({error_seleccion:false});
        
        for (var i=0; i<grupo.length; i++) {
            if (grupo[i].type == 'radio' && grupo[i].checked) {
                console.log("Valor: ",grupo[i].value);
                dataset = grupo[i].value;
                break;
            }
        }
        
        if(dataset === null){
            this.setState({error_seleccion:true});
        }else{
            console.log("Llega aquí.");
            this.setState({id_seleccionado:dataset});
        }
        
    }


    obtiene_fecha(datetime){
        var fecha = "";
        fecha = datetime.split("T")[0];
        return fecha;
    }


    render(){
        console.log("Se ejecuta Datasets");

        if (this.state.id_detalles !== null) {
            return <Redirect push to={{
                pathname: '/datasets/' + this.state.id_detalles,
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        if (this.state.id_seleccionado !== null) {
            return <Redirect push to={{
                pathname: this.props.location.state.url_regreso,
                state: { id_dataset: this.state.id_seleccionado,
                         token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>
        }


        
        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Cabecera con_cuenta = {true} mensaje_ayuda = {this.state.mensaje_ayuda} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <BotonAtras/>
        
                        
        
                        <div className="container">
                            <div className = "row">
                                <div className="card col-md-12 caja" >
                                <div className="card-body">
                                    <h5 class="card-title">Select a dataset for training the model: </h5>
                                    {this.state.cargando === true ? (
                                        <div className="row" id = "cargar">
                                            <div className = "col text-center">
                                                <div className="spinner-border text-dark cargador" role="status">
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <table className = "table table-striped tabla_scroll_x tabla_scroll_y">
                                            <thead>
                                                <tr>
                                                    <th scope="col" className = "ancho_col"></th>
                                                    <th scope="col" className = "ancho_col">Id </th>
                                                    <th scope="col" className = "ancho_col">Creator </th>
                                                    <th scope="col" className = "ancho_col">Creation Date </th>
                                                    <th scope="col" className = "ancho_col">Number of meshes </th>
                                                    <th scope="col" className = "ancho_col"></th>
        
        
                                                </tr>
                                            </thead>
        
                                            <tbody>
        
                                                    {this.state.lista_datasets.map( (dataset) =>
                                                        <tr key = {dataset.id}>
                                                            <td><input type="radio" name = "lista_datasets" value = {dataset.id}/></td>
                                                            <th scope="row" >{dataset.id}</th>
        
                                                            <td>{dataset.creador.username}</td>
                                                            <td>{this.obtiene_fecha(dataset.fecha_creacion)}</td>
                                                            <td>{dataset.n_mallas}</td>
                                                            <td> <span className = "btn-link cursor_puntero" onClick = {() => this.ver_detalles_dataset(dataset.id)}> Ver detalles</span> </td>
        
        
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
                                                    <p>Debes seleccionar un dataset.</p>
                                                </div>                                
                                            </div>
                                            <div className = "col-md-3"></div>
                                        </div>
                                    }
                                       <div class = "row text-center margin_top_2">
                                        <div class="col-md-12">
                                            <input type="button" class="btn btn-dark  mb-2" id = "btn_dataset" value= "Select dataset" onClick = {() => this.seleccionar_dataset()}/>
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

export default DatasetsEntrenamiento;
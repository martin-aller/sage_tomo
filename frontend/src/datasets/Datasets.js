import React, { Component } from 'react'
import Cabecera from '../gestion/Cabecera';
import BotonAtras from '../gestion/BotonAtras';
import SinSesion from '../gestion/SinSesion'
import ModalSiNo from '../gestion/ModalSiNo';

import axios from 'axios';
import {Redirect} from "react-router-dom";



class Datasets extends Component{
    //Vista con el listado de datasets disponibles para un usuario
    
    constructor(props){
        console.log("Llega al constructor");
        super(props);
        this.state = {
            lista_datasets: [],
            cargando: true,
            id_detalles: null,
            showModal: false,
            id_eliminar: null,
            id_descargar: null,
            aDatasetEliminado: false,
            aGenerarDataset: false,
            aSubirDataset: false,
            mensaje_ayuda: <div> <p>This page shows the datasets that you have generated or uploaded or the public datasets generated 
                                    or uploaded by other users.</p>
                            <p>You can consult the detailed information about each dataset (number of bodies with one, two and 
                                three artifacts, minimum and maximum radius of the artifacts, etc). You can also download in 
                                CSV format any of the datasets in the list. In each of the lines of the downloaded CSV, the 
                                information of a mesh will be included: voltages, conductivities and number of artifacts. 
                                These values will be separated by semicolons.</p>
                            <p>On the other hand, in this window you also have the possibility to delete the datasets that you have trained yourself.</p></div>

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

    setModal(estado){
        this.setState({showModal: estado});
    }

    setModalId(estado,id){
        this.setState({showModal: estado, id_eliminar: id});

    }



    eliminar_dataset(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }
        const id = this.state.id_eliminar;

        axios.delete(this.props.location.state.url_base + "api_tomo/datasets/" + id + "/", config)
        .then(
            response => {
                console.log("Dataset eliminado.");
                this.setState({aDatasetEliminado: true});

            })
        .catch(error => {
            //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
            console.error('Se ha producido un error.', error);
        });   
    }

    acceder_generar_dataset(){
        this.setState({aGenerarDataset: true});
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


        if (this.state.aDatasetEliminado === true) {
            return <Redirect push to={{
                pathname: '/objeto_eliminado',
                state: { tipo_objeto: "dataset",
                         id: this.state.id_eliminar,
                         token: this.props.location.state.token,
                         url_base: this.props.location.state.url_base
                         }
            }}/>
        }


        if (this.state.aGenerarDataset === true) {
            return <Redirect push to={{
                pathname: '/dataset_generar',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }



        if (this.state.aSubirDataset === true) {
            return <Redirect push to={{
                pathname: '/dataset_subir',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }


        if (this.state.id_descargar !== null) {
            return <Redirect push to={{
                pathname: '/dataset_descargar/' + this.state.id_descargar,
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }
        
        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Cabecera con_cuenta = {true} mensaje_ayuda = {this.state.mensaje_ayuda} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <BotonAtras/>
        
                        
                        <ModalSiNo
                            show = {this.state.showModal}
                            si = {() => this.eliminar_dataset()}
                            no = {() => this.setModal(false)}
                            cabecera = "Remove dataset"
                            mensaje = {"¿Do you really want to remove the dataset with ID " + this.state.id_eliminar +"?"}
                        />
        
        
                        <div className="container">
                            <div className = "row">
                                <div className="card col-md-12 caja" >
                                <div className="card-body">
                                    <h3 className="card-title titulo" > <b>Datasets</b> </h3>
                                    {this.state.cargando === true ? (
                                        <div className="row" id = "cargar">
                                            <div className = "col text-center">
                                                <div className="spinner-border text-dark cargador" role="status">
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            {this.state.lista_datasets.length > 0 ? (
                                                <table className = "table table-striped tabla_scroll_x tabla_scroll_y">
                                                    <thead>
                                                        <tr>
                                                            <th scope="col" className = "ancho_col">Id </th>
                                                            <th scope="col" className = "ancho_col">Creator </th>
                                                            <th scope="col" className = "ancho_col">Creation date </th>
                                                            <th scope="col" className = "ancho_col">Number of meshes </th>
                                                            <th scope="col" className = "ancho_col"></th>
                                                            <th scope="col" className = "ancho_col"></th>
                                                            <th scope="col" className = "ancho_col"></th>
                
                                                        </tr>
                                                    </thead>
                
                                                    <tbody>
                
                                                        {this.state.lista_datasets.map( (dataset) =>
                                                            <tr key = {dataset.id}>
                                                                <th scope="row" >{dataset.id}</th>
                
                                                                <td>{dataset.creador.username}</td>
                                                                <td>{this.obtiene_fecha(dataset.fecha_creacion)}</td>
                                                                <td>{dataset.n_mallas}</td>
                                                                <td> <span className = "btn-link cursor_puntero" onClick = {() => this.ver_detalles_dataset(dataset.id)}> View details</span> </td>
                
                                                                <td> <span  className = "btn-link cursor_puntero" onClick={() => this.setState({id_descargar: dataset.id})}> Download</span> </td>
                
                                                                {sessionStorage.usuario === dataset.creador.username ? (
                                                                    <td><span className = "btn-link cursor_puntero"  onClick = {() => this.setModalId(true, dataset.id)}> Remove dataset</span></td>
                                                                ):(
                                                                    <td></td>
                                                                )}
                
                                                            </tr>
                                                        )}
                
                                                    </tbody>
                                                </table>
                                            ):(
                                                <div className = "row text-center">
                                                        <div className = "col-sm-2"></div>
                                                        <p className = "col-sm-8 alert alert-primary sin_elementos"  role = "alert"> 
                                                        There are currently no datasets stored in the system.
                                                        </p>
                                                        <div className = "col-sm-2"></div>
                                                </div>
                                            )}
                                        </div>


                                    )}
                                   
                                </div>
                                </div>
                            </div>
                        </div>
        
                        <div className = "container contenedor_botones_dat">
                            <div className = "row">
                                <div className="col-md-6 text-center my-auto width_14">
                                    <span  className="btn-lg btn-dark mb-2 sin_decoracion cursor_puntero" onClick = {() =>this.setState({aSubirDataset:true})}>Upload dataset</span>
                                </div>
        
                                <div className="col-md-6 text-center my-auto width_14">
                                    <span className="btn-lg btn-dark mb-2 sin_decoracion cursor_puntero" onClick = {() =>this.acceder_generar_dataset()}>Generate dataset</span>
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

export default Datasets;
import React, { Component } from 'react'
import Cabecera from '../gestion/Cabecera';
import BotonAtras from '../gestion/BotonAtras';
import SinSesion from '../gestion/SinSesion'
import ModalSiNo from '../gestion/ModalSiNo';

import {Redirect} from "react-router-dom";
import axios from 'axios';


class TareasDatasets extends Component{
    //Vista de las tareas del usuario relacionadas con datasets (subidas y generación).

    constructor(props){
        console.log("Llega al constructor");
        super(props);
        this.state = {
            en_curso: [],
            finalizadas: [],
            cargando: false,
            id_detalles: null,
            id_descartar: null,
            id_cancelar: null,
            aDatasetDescartado: false,
            showModalCancelar: false,
            showModalDescartar: false,
            mensaje_ayuda: <div>En la tabla superior de esta ventana se muestra el listado de datasets que se encuentran en proceso de ser subidos o generados.
            Si no deseas continuar con alguna de las tareas en curso, pulsa en Cancelar tarea en la fila del dataset correspondiente. 
            En la tabla inferior de la ventana se muestran los datasets ya subidos o generados. No podrás hacer uso de un dataset
            generado hasta que no selecciones la opción Guardar dataset.</div>
          }
    }

    componentDidMount(){
        this.get_tareas_en_curso();
        this.get_tareas_finalizadas();
        this.setState({cargando: false});
    }


    get_tareas_en_curso(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        axios.get(this.props.location.state.url_base + "api_tomo/datasets_generando/", config)
        .then(
            response => {
                console.log("Obtener datasets entrenando.");
                this.setState({en_curso: response.data});
                console.log(response.data);
                console.log("RESPUESTA: ", response.data);
                //console.log(response.data[0].creador.username);
                //console.log("CREADOR: ", response.data[1])

            })
        .catch(error => {
            //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
            console.error('Se ha producido un error.', error);
        });
    }


    get_tareas_finalizadas(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        axios.get(this.props.location.state.url_base + "api_tomo/datasets_pendientes/", config)
        .then(
            response => {
                console.log("Obtener datasets finalizadas.");
                this.setState({finalizadas: response.data});
                console.log(response.data);
                console.log("RESPUESTA: ", response.data);

                //console.log(response.data[0].creador.username);
                //console.log("CREADOR: ", response.data[1])

            })
        .catch(error => {
            //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
            console.error('Se ha producido un error.', error);
        });
    }

    ver_detalles_dataset(id){
        console.log("Función detalles.")
        this.setState({id_detalles : id});
    }

    setModalDescartar(estado){
        this.setState({showModalDescartar: estado});
    }

    setModalDescartarId(estado,id){
        this.setState({showModalDescartar: estado, id_descartar: id});

    }

    setModalCancelar(estado){
        this.setState({showModalCancelar: estado});
    }

    setModalCancelarId(estado,id){
        this.setState({showModalCancelar: estado, id_cancelar: id});

    }





    descartar_dataset(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }
        const id = this.state.id_descartar;

        axios.delete(this.props.location.state.url_base + "api_tomo/datasets/" + id + "/", config)
        .then(
            response => {
                console.log("Dataset descartar.");
                this.setState({aDatasetDescartado: true});

            })
        .catch(error => {
            //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
            console.error('Se ha producido un error.', error);
        });   
    }


    guardar_dataset(id){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        const par = {
            estado: 'finalizado', 

        }

        axios.patch(this.props.location.state.url_base + "api_tomo/datasets/" + id + "/", par, config)
        .then(
            response => {
                console.log("Dataset guardar.");
                this.setState({cargando: true});
                this.get_tareas_en_curso();
                this.get_tareas_finalizadas();
                this.setState({cargando: false});

            })
        .catch(error => {
            //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
            console.error('Se ha producido un error.', error);
        }); 
    }

    cancelar_tarea(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }
        const id = this.state.id_cancelar;

        axios.delete(this.props.location.state.url_base + "api_tomo/cancelar_tarea_dataset/" + id + "/", config)
        .then(
            response => {
                console.log("Cancelar_tarea.");
                this.setState({cargando: true});
                this.get_tareas_en_curso();
                this.get_tareas_finalizadas();
                this.setState({cargando: false, showModalCancelar : false});
            })
        .catch(error => {
            //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
            console.error('Se ha producido un error.', error);
        });   
    }

    refrescar(){
        this.setState({cargando: true});
        setTimeout(() => {
            this.get_tareas_en_curso();
            this.get_tareas_finalizadas();
            this.setState({cargando: false, showModalCancelar : false});
        }, 50);

    }

    formatea_datetime(datetime){
        var datetime_formateado = "";
        datetime_formateado = datetime.replace("T", ", ");
        datetime_formateado = datetime_formateado.replace("Z", "").split(".")[0];
        return datetime_formateado;
    }


    render(){
        console.log("Se ejecuta Entrenamientos");

        if (this.state.id_detalles !== null) {
            return <Redirect push to={{
                pathname: '/datasets/' + this.state.id_detalles,
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        if (this.state.aDatasetDescartado === true) {
            return <Redirect push to={{
                pathname: '/objeto_descartado',
                state: { tipo_objeto: "dataset", id: this.state.id_descartar, token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>
        }

        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Cabecera con_cuenta = {true} mensaje_ayuda = {this.state.mensaje_ayuda} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <div className = "fixed-top top_5_5" >
                            <BotonAtras sin_espaciado = {true}/>
                 
                        </div>
                        <div className = "fixed-top top_8" >
                            <span className = "btn btn-dark btn-sm  btn_refrescar" onClick = {() => this.refrescar()}> 
                                <img className="img-responsive btn_refrescar_img" src={process.env.PUBLIC_URL + '/imagenes/reload.png'}  width = "20rem"/> Refresh
                            </span>                 
                        </div>

                
                        <ModalSiNo
                            show = {this.state.showModalCancelar}
                            si = {() => this.cancelar_tarea()}
                            no = {() => this.setModalCancelar(false)}
                            cabecera = "Cancel task"
                            mensaje = {"¿Do you really wish to cancel dataset " + this.state.id_cancelar +" task?"}
                        />
        
                        <ModalSiNo
                            show = {this.state.showModalDescartar}
                            si = {() => this.descartar_dataset()}
                            no = {() => this.setModalDescartar(false)}
                            cabecera = "Descartar dataset"
                            mensaje = {"¿Do you really wish to discard dataset " + this.state.id_descartar +"?"}
                        />
        
        
        
                        <div className="container">
                            <div className = "row card caja">
                                <div className="card-body ">
                                    <h4 className="card-title titulo">Datasets in the process of being uploaded or generated  </h4>
                                    {this.state.cargando === true ? (
                                        <div className="row" id = "cargar">
                                            <div className = "col text-center">
                                                <div className="spinner-border text-dark cargador" role="status">
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            {this.state.en_curso.length > 0 ? (
                                                <table className = "table table-striped tabla_scroll_x tabla_scroll_y_20">
                                                    <thead>
                                                    <tr>
                                                        <th scope="col" className = "ancho_col2">Id </th>
                                                        <th scope="col" className = "ancho_col2">Start of the task</th>
                                                        <th scope="col" className = "ancho_col2"></th>
                                                        <th scope="col" className = "ancho_col2"></th>
                                    
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.en_curso.map((d) =>
                                                        <tr key = {d.id}>
                                                            <th scope="row">{d.id}</th>
                                                            <td >{this.formatea_datetime(d.fecha_creacion)}</td>
                                                            <td >	
                                                                <span className = "btn-link cursor_puntero" onClick = {() => this.ver_detalles_dataset(d.id)}> View details</span>
                                                            </td>
                                                            <td className = "ancho_col2">
                                                                <span className = "btn-link cursor_puntero"  onClick = {() => this.setModalCancelarId(true, d.id)}> Cancel task</span>
                                                            </td>
        
                                                        </tr>                                    
                                                    )}
                
                                                </tbody>
                                                </table>
                                            ):(
                                                <div className = "row text-center">
                                                    <div className = "col-sm-2"></div>
                                                    <p className = "col-sm-8 alert alert-primary sin_elementos"  role = "alert"> 
                                                    There are currently no datasets in the process of being uploaded or generated.
                                                    </p>
                                                    <div className = "col-sm-2"></div>
                                                </div>
                                            )}
                                        </div>
                                    )}
        
        
                                </div>
                            </div>
                        </div>
                        <br/>
                        <br/>
                        <br/>
                        <div className="container">
                            <div className = "row card caja">
                                <div className="card-body ">
                                    <h4 className="card-title titulo">Uploaded or generated datasets </h4>
                                    {this.state.cargando === true ? (
                                        <div className="row" id = "cargar">
                                            <div className = "col text-center">
                                                <div className="spinner-border text-dark cargador" role="status">
                                                </div>
                                            </div>
                                        </div>                                
                                    ):(
                                        <div>
        
                                            {this.state.finalizadas.length > 0 ? (
                                                <table className = "table table-striped tabla_scroll_x tabla_scroll_y_20">
                                                <thead>
                                                <tr>
        
                                                    <th scope="col" className = "ancho_col2">Id </th>
                                                    <th scope="col" className = "ancho_col2">Start of the task</th>
                                                    <th scope="col" className = "ancho_col2">Number of meshes </th>
                                                    <th scope="col" className = "ancho_col2"></th>
                                                    <th scope="col" className = "ancho_col2"></th>
                                                    <th scope="col" className = "ancho_col2"></th>
        
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.state.finalizadas.map((d) => 
                                                        <tr key = {d.id}>
                                                            <th scope="row">{d.id}</th>
                                                            <td>{this.formatea_datetime(d.fecha_creacion)}</td>
                                                            <td>{d.n_mallas}</td>
        
                                                            <td>
                                                                <span className = "btn-link cursor_puntero" onClick = {() => this.ver_detalles_dataset(d.id)}> View details</span>
                                                            </td>
                                                            <td>
                                                                <span className = "btn-link cursor_puntero" onClick = {() => this.guardar_dataset(d.id)}> Save dataset</span>
                                                            </td>
                                                            <td>
                                                                <span className = "btn-link cursor_puntero"  onClick = {() => this.setModalDescartarId(true, d.id)}> Discard dataset</span>
                                                            </td>
        
                                                       
        
                                                        </tr>
                                                )}
        
                                            </tbody>
                                            </table>
                                            ):(
                                                <div className = "row text-center">
                                                    <div className = "col-sm-2"></div>
                                                    <p className = "col-sm-8 alert alert-primary sin_elementos" role = "alert"> 
                                                        There are currently no completed tasks.
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
                ):(
                    <SinSesion/>
                )}

            </div>
        );
    }
}

export default TareasDatasets;
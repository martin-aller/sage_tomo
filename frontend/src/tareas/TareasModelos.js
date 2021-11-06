import React, { Component } from 'react'
import Cabecera from '../gestion/Cabecera';
import BotonAtras from '../gestion/BotonAtras';
import SinSesion from '../gestion/SinSesion'
import ModalSiNo from '../gestion/ModalSiNo';

import {Redirect} from "react-router-dom";
import axios from 'axios';


class TareasModelos extends Component{
    //Vista con los entrenamientos del usuario.
    
    constructor(props){
        console.log("Llega al constructor");
        super(props);
        this.state = {
            en_curso: [],
            finalizados: [],
            cargando: false,
            id_detalles: null,
            id_descartar: null,
            id_cancelar: null,
            aModeloDescartado: false,
            showModalCancelar: false,
            showModalDescartar: false,
            mensaje_ayuda: <div>En la tabla superior de esta ventana se muestra el listado de tus modelos que se encuentran en entrenamiento. Si no deseas continuar
            con alguno de los entrenamientos, pulsa en Cancelar entrenamiento en la fila del modelo correspondiente. En la tabla inferior de la
            ventana se muestra el listado de entrenamientos ya finalizados. Para cada uno de los entrenamientos finalizados, tienes la opción
            de guardar el modelo entrenado o de descartarlo.</div>
          }
    }

    componentDidMount(){
        this.get_entrenamientos_en_curso();
        this.get_entrenamientos_finalizados();
        this.setState({cargando: false});
    }


    get_entrenamientos_en_curso(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        axios.get(this.props.location.state.url_base + "api_tomo/modelos_entrenando/", config)
        .then(
            response => {
                console.log("Obtener modelos entrenando.");
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


    get_entrenamientos_finalizados(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        axios.get(this.props.location.state.url_base + "api_tomo/modelos_pendientes/", config)
        .then(
            response => {
                console.log("Obtener modelos finalizados.");
                this.setState({finalizados: response.data});
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

    ver_detalles_modelo(id){
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





    descartar_modelo(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }
        const id = this.state.id_descartar;

        axios.delete(this.props.location.state.url_base + "api_tomo/modelos/" + id + "/", config)
        .then(
            response => {
                console.log("Modelo descartar.");
                this.setState({aModeloDescartado: true});

            })
        .catch(error => {
            //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
            console.error('Se ha producido un error.', error);
        });   
    }


    guardar_modelo(id){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        const par = {
            estado: 'finalizado', 

        }

        axios.patch(this.props.location.state.url_base + "api_tomo/modelos/" + id + "/", par, config)
        .then(
            response => {
                console.log("Modelo guardar.");
                this.setState({cargando: true});
                this.get_entrenamientos_en_curso();
                this.get_entrenamientos_finalizados();
                this.setState({cargando: false});

            })
        .catch(error => {
            //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
            console.error('Se ha producido un error.', error);
        }); 
    }

    cancelar_entrenamiento(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }
        const id = this.state.id_cancelar;

        axios.delete(this.props.location.state.url_base + "api_tomo/cancelar_entrenamiento/" + id + "/", config)
        .then(
            response => {
                console.log("Cancelar_entrenamiento.");
                this.setState({cargando: true});
                this.get_entrenamientos_en_curso();
                this.get_entrenamientos_finalizados();
                this.setState({cargando: false, showModalCancelar : false});
            })
        .catch(error => {
            //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
            console.error('Se ha producido un error.', error);
        });   
    }

    refrescar(){
        this.setState({cargando: true});
        this.get_entrenamientos_en_curso();
        this.get_entrenamientos_finalizados();
        this.setState({cargando: false, showModalCancelar : false});
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
                pathname: '/modelos/' + this.state.id_detalles,
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        if (this.state.aModeloDescartado === true) {
            return <Redirect push to={{
                pathname: '/objeto_descartado',
                state: { tipo_objeto: "modelo", id: this.state.id_descartar, token: this.props.location.state.token, url_base: this.props.location.state.url_base}
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
                            si = {() => this.cancelar_entrenamiento()}
                            no = {() => this.setModalCancelar(false)}
                            cabecera = "Cancel training"
                            mensaje = {"¿Do you really wish to cancel the training of the model with ID " + this.state.id_cancelar +"?"}
                        />
        
                        <ModalSiNo
                            show = {this.state.showModalDescartar}
                            si = {() => this.descartar_modelo()}
                            no = {() => this.setModalDescartar(false)}
                            cabecera = "Discard model"
                            mensaje = {"¿Do you really wish to discard the model with ID " + this.state.id_descartar +"?"}
                        />
        
        
        
                        <div className="container">
                            <div className = "row card caja">
                                <div className="card-body ">
                                    <h4 className="card-title titulo">Ongoing trainings </h4>
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
                                                            <th scope="col" className = "ancho_col2"> Id </th>
                                                            <th scope="col" className = "ancho_col2"> Type </th>
                                                            <th scope="col" className = "ancho_col2"> Training start</th>
                                                            <th scope="col" className = "ancho_col2"> Additional comments </th>
                                                            <th scope="col" className = "ancho_col2"></th>
                                                            <th scope="col" className = "ancho_col2"></th>
                    
                                                        </tr>
                                                    </thead>
                                                <tbody>
                                                    {this.state.en_curso.map((e) =>
                                                        <tr key = {e.id}>
                                                            <th scope="row" className = "ancho_col2">{e.id}</th>
                                                            <td className = "ancho_col2">{e.tipo}</td>
                                                            <td className = "ancho_col2">{this.formatea_datetime(e.fecha_hora_inicio)}</td>
                                                            <td className = "ancho_col2">{e.comentarios_adicionales}</td>
                                                            <td className = "ancho_col2">	
                                                                <span className = "btn-link cursor_puntero" onClick = {() => this.ver_detalles_modelo(e.id)}> View details</span>
                                                            </td>
                                                            <td className = "ancho_col2">
                                                                <span className = "btn-link cursor_puntero"  onClick = {() => this.setModalCancelarId(true, e.id)}> Cancel training</span>
                                                            </td>
        
                                                        </tr>                                    
                                                    )}
                
                                                </tbody>
                                                </table>
                                            ):(
                                                <div className = "row text-center">
                                                    <div className = "col-sm-2"></div>
                                                    <p className = "col-sm-8 alert alert-primary sin_elementos"  role = "alert"> 
                                                        There are no models being trained at this time.
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
                                    <h4 className="card-title titulo">Completed trainings </h4>
                                    {this.state.cargando === true ? (
                                        <div className="row" id = "cargar">
                                            <div className = "col text-center">
                                                <div className="spinner-border text-dark cargador" role="status">
                                                </div>
                                            </div>
                                        </div>                                
                                    ):(
                                        <div>
        
                                            {this.state.finalizados.length > 0 ? (
                                                <table className = "table table-striped tabla_scroll_x tabla_scroll_y_20">
                                                <thead>
                                                <tr>
        
                                                    <th scope="col">Id </th>
                                                    <th scope="col">Type </th>
                                                    <th scope="col">Training start</th>
                                                    <th scope="col">End of training</th>
                                                    <th scope="col">Additional comments </th>
                                                    <th scope="col"></th>
                                                    <th scope="col"></th>
                                                    <th scope="col"></th>
        
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.state.finalizados.map((e) => 
                                                        <tr key = {e.id}>
        
                                                            <th scope="row">{e.id}</th>
                                                            <td>{e.tipo}</td>
                                                            <td>{this.formatea_datetime(e.fecha_hora_inicio)}</td>
                                                            <td>{this.formatea_datetime(e.fecha_hora_fin)}</td>
                                                            <td>{e.comentarios_adicionales}</td>
                                                            <td>
                                                                <span className = "btn-link cursor_puntero" onClick = {() => this.ver_detalles_modelo(e.id)}> View details</span>
                                                            </td>
                                                            <td>
                                                            <span className = "btn-link cursor_puntero" onClick = {() => this.guardar_modelo(e.id)}> Save model</span>
                                                            </td>
                                                            <td><span className = "btn-link cursor_puntero"  onClick = {() => this.setModalDescartarId(true, e.id)}> Discard model</span></td>
                                                       
        
                                                        </tr>
                                                )}
        
                                            </tbody>
                                            </table>
                                            ):(
                                                <div className = "row text-center">
                                                    <div className = "col-sm-2"></div>
                                                    <p className = "col-sm-8 alert alert-primary sin_elementos" role = "alert"> 
                                                    No models have completed their training yet.
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

export default TareasModelos;
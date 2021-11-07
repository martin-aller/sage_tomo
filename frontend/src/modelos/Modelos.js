import React, { Component } from 'react'
import Cabecera from '../gestion/Cabecera';
import BotonAtras from '../gestion/BotonAtras';
import SinSesion from '../gestion/SinSesion'
import ModalSiNo from '../gestion/ModalSiNo';

import axios from 'axios';
import {Redirect} from "react-router-dom";



class Modelos extends Component{
    //Lista de modelos disponibles para el usuario.
    
    constructor(props){
        console.log("Llega al constructor");
        super(props);
        this.state = {
            lista_modelos: [],
            lista_modelos_seleccionados: [],
            cargando: true,
            id_detalles: null,
            tipo_modelo: null,
            tipo_busqueda: null,
            showModal: false,
            id_eliminar: null,
            n_sel: 0,
            aModeloEliminado: false,
            aTiposModelos: false,
            aDefinirComparacion: false,
            error_seleccion: false,
            mensaje_ayuda: <div><p>This page shows the models that you have trained yourself or the public models trained by other 
                users. You can consult the detailed information of each model (dataset with which it was trained, results obtained 
                by the evaluation with metrics, etc) by clicking on View details.</p>
            <p>On the other hand, you have the possibility to delete the models that you have trained yourself.</p>
            <p>By clicking on the boxes on the left side of the table, you can select up to four models to compare using different 
                metrics.</p></div>

          }
          this.handleChangeTipoModelo = this.handleChangeTipoModelo.bind(this);
          this.handleChangeTipoBusqueda = this.handleChangeTipoBusqueda.bind(this);

    }

    handleChangeTipoModelo(e){
        console.log("Hola 1");
        this.setState({tipo_modelo: e.target.value});
    }

    handleChangeTipoBusqueda(e){
        console.log("Hola 2");
        this.setState({tipo_busqueda: e.target.value});
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


    filtrar_modelos(){
        this.setState({cargando: true});
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        var url = "";

        if(this.state.tipo_busqueda === "propios"){
            url = this.props.location.state.url_base + "api_tomo/modelos/?propios&tipo=" + this.state.tipo_modelo;
            console.log("URL: ", url);
        }else{
            url = this.props.location.state.url_base + "api_tomo/modelos/?tipo=" + this.state.tipo_modelo;
            console.log("URL: ", url);
        }

        axios.get(url, config)
        .then(
            response => {
                console.log("Filter models.");
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

    setModal(estado){
        this.setState({showModal: estado});
    }

    setModalId(estado,id){
        this.setState({showModal: estado, id_eliminar: id});

    }





    eliminar_modelo(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }
        const id = this.state.id_eliminar;

        axios.delete(this.props.location.state.url_base + "api_tomo/modelos/" + id + "/", config)
        .then(
            response => {
                console.log("Modelo eliminado.");
                this.setState({aModeloEliminado: true});

            })
        .catch(error => {
            //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
            console.error('Se ha producido un error.', error);
        });   
    }


    limite_seleccion(id_input){
        var n_sel_aux = this.state.n_sel;
        var checkboxes = document.getElementsByName('lista_modelos');


        if(document.getElementById(id_input).checked === true){ //Se marca un nuevo checkbox
            console.log("Uno más");
            n_sel_aux++;

            if(n_sel_aux ===4){
                for (var checkbox of checkboxes) {
                    if (!checkbox.checked){
                        //n_sel_aux++;
                        //console.log("checkeados: ", n_sel);
                        checkbox.disabled = true;
                    }
                }
            }

        }else{//Se desmarca un checkbox
            n_sel_aux--;
            if(n_sel_aux ===3){
                for (var checkbox of checkboxes) {
                    if (!checkbox.checked){
                        //n_sel_aux++;
                        //console.log("checkeados: ", n_sel);
                        checkbox.disabled = false;
                    }
                }
            }
        }

        this.setState({n_sel: n_sel_aux});   
    }


    acceder_definir_comparacion(){
        var lista_aux = [];
        var checkboxes = document.getElementsByName('lista_modelos');
        for (var checkbox of checkboxes) {
            if (checkbox.checked){
                //n_sel_aux++;
                //console.log("checkeados: ", n_sel);
                lista_aux.push(checkbox.value);
            }
        }

        console.log("LISTA: ", lista_aux);
        if (lista_aux.length >= 2){
            this.setState({lista_modelos_seleccionados: lista_aux, aDefinirComparacion: true});
        }else{
            this.setState({error_seleccion:true});
        }

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



    render(){
        console.log("Se ejecuta modelos");

        if (this.state.id_detalles !== null) {
            return <Redirect push to={{
                pathname: '/modelos/' + this.state.id_detalles,
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        if (this.state.aModeloEliminado === true) {
            return <Redirect push to={{
                pathname: '/objeto_eliminado',
                state: { tipo_objeto: "modelo",
                         id: this.state.id_eliminar,
                         token: this.props.location.state.token, url_base: this.props.location.state.url_base
                         }
            }}/>
        }

        if (this.state.aTiposModelos === true) {
            return <Redirect push to={{
                pathname: '/tipos_modelos',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        if (this.state.aDefinirComparacion === true) {
            return <Redirect push to={{
                pathname: '/modelos_definir_comparacion',
                state: { lista_modelos: this.state.lista_modelos_seleccionados, 
                         token: this.props.location.state.token, url_base: this.props.location.state.url_base}
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
                            si = {() => this.eliminar_modelo()}
                            no = {() => this.setModal(false)}
                            cabecera = "Eliminar modelo"
                            mensaje = {"¿Deseas realmente eliminar el modelo con ID " + this.state.id_eliminar +"?"}
                        />
        
        
        
                        <div className="container card caja">
                                    <div className="card-body ">
                                        <h3 className="card-title titulo" > <b>Models</b> </h3>
                                        <div className = "row" >
                                            <div className="col-md-12 width_14">
                                                <form action="{% url 'tomo:filtrar_modelos' %}" method = "post" className = "margin_left_3">
                                                    <div className = "row">
                                                        <div className="col-md-6 width_14" >
                                                            <div className="form-group row">
                                                                <label htmlFor="tipo" className="col-sm-4 col-form-label"> Type of model: </label>
                                                                <div className="col-sm-8">
                                                                    <select id="tipo" name = "tipo" className="form-control"
                                                                     value={this.state.tipo_modelo} onChange={this.handleChangeTipoModelo} >
                                                                        <option selected value = "todos"> All the models</option>
                                                                        <option value = "DNN"> Neural Networks </option>
                                                                        <option value = "RF"> Random Forests </option>
                                                                        <option value = "SVM"> Support vector machines </option>
                                                                    </select>
                                                                </div>
                                                            </div>
        
                                                            <div className="form-group row">
                                                                <label htmlFor="publico" className="col-sm-4 col-form-label">  Type of search: </label>
                                                                <div className="col-sm-8">
                                                                    <select id="publico" name = "publico" className="form-control"
                                                                    value={this.state.tipo_busqueda} onChange={this.handleChangeTipoBusqueda} >
                                                                        <option  value = "todos"> Search among all the models </option>
                                                                        <option  value = "propios"> Search only among my models</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6 text-center my-auto width_14">
                                                                <input type="button" className="btn-lg btn-dark mb-2 " onClick= {() => this.filtrar_modelos()}
                                                                value = "Filter models"/> 
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
        
                                        <br/>
                                        <h5 className = "text-center"> You can select up to <b>four models</b> for comparing them. </h5>
                                        <br/>
        
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
                                                                <div> 
                                                                    {this.state.lista_modelos.length > 0 ? (
                                                                        <table className = "table table-striped tabla_scroll_y_20 tabla_scroll_x">
                                                                            <thead>
                                                                            <tr>
                                                                                <th scope="col">Select for comparison</th>
                
                                                                                <th scope="col">Id </th>
                                                                                <th scope="col">Type </th>
                                                                                <th scope="col">Dataset</th>
                                                                                <th scope="col">MSE </th>
                                                                                <th scope="col">Additional comments </th>
                                                                                <th scope="col">Creator </th>
                                                                                <th scope="col"></th>
                                                                                <th scope="col"></th>
                
                                                                            </tr>
                
                                                                            </thead>
                                                                            <tbody>
                                                                                {this.state.lista_modelos.map( (modelo) => 
                                                                                <tr key = {modelo.id}>
                                                                                        <td><input type="checkbox" name = "lista_modelos" id = {"input" + modelo.id} 
                                                                                                value = {modelo.id} onChange = {() => this.limite_seleccion("input" + modelo.id)}/></td>
                
                                                                                        <th scope="row">{modelo.id}</th>
                                                                                        <td>{modelo.tipo}</td>
                                                                                        <td>{modelo.dataset}</td>
                                                                                        <td>
                                                                                            {this.obtiene_mse(modelo)}
                                                                                        </td>
                
                
                                                                                        <td>{modelo.comentarios_adicionales}</td>
                                                                                        <td>{modelo.creador.username}</td>
                                                                                        <td> <span className = "btn-link cursor_puntero" onClick = {() => this.ver_detalles_modelo(modelo.id)}> View details</span> </td>
                                                                            
                
                                                                                        {sessionStorage.usuario === modelo.creador.username ? (
                                                                                            <td><span className = "btn-link cursor_puntero"  onClick = {() => this.setModalId(true, modelo.id)}> Remove model</span></td>
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
                                                                                    There are no models that comply with the filters.
                                                                                    </p>
                                                                                    <div className = "col-sm-2"></div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                
        
                                                            )}
                
        
                                                    </div>
                                                </div>
                                        </form>
        
        
                                    </div>
                        </div>
        
                                <div className = "container margin_top_1">
                                    { this.state.error_seleccion === true &&
                                        <div className = "row">
                                            <div className="col-md-12 text-center my-auto width_14" >
                                                    <div className="alert alert-danger" role="alert" id = "mensaje_error_seleccion">
                                                        Selecciona al menos <b> dos </b> modelos para realizar la comparación.
                                                    </div>
        
                                            </div>
                                        </div> 
                                    }
                                    <div className = "row">
                                        <div className="col-md-6 text-center my-auto width_14">
                                            <button type = "submit" className="btn-lg btn-dark mb-2 sin_decoracion"  onClick = {() => this.acceder_definir_comparacion()}> 
                                                Compare models 
                                            </button>
                                        </div>
        
                                        <div className="col-md-6 text-center my-auto width_14">
                                            <input type = "button" className="btn-lg btn-dark mb-2 puntero_cursor" value = "Train new model" onClick = {() => this.setState({aTiposModelos : true})}/>      
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

export default Modelos;
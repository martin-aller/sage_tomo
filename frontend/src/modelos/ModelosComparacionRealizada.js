import React, { Component, lazy } from 'react'
import Cabecera from '../gestion/Cabecera';
import BotonAtras from '../gestion/BotonAtras';
import SinSesion from '../gestion/SinSesion'
import {Redirect} from "react-router-dom";
import Cargar from '../gestion/Cargar'
import axios from 'axios';


class ModelosComparacionRealizada extends Component{
     //Vista que se muestra al usuario tras realizar la comparación de varios modelos.
    constructor(props){
        super(props);
        this.state = {
            lista_modelos : [],
            lista_metricas : [],
            comparacion : null,
            realizando_reconstruccion: true,
            realizando_comparacion : true,
            tipo_contenedor: null,
            urls_imgs: null,
            indice_malla: null,
            ancho_columna: 3,
            error_modelo: false,
            mensaje_ayuda: <div>This window shows the results obtained for the comparison of the indicated models. The first table 
                shows the results obtained by each of the metrics for each of the models. In the case that in the previous window you 
                had selected the percentage of success as one of the metrics, a confusion matrix will also be displayed. In the lower 
                part of the window, you will be shown the reconstruction of the image of a mesh randomly selected from among the meshes
                of the dataset by which the comparison was made.  The first image shown is the actual image and the following images 
                are the images associated with the predictions made by each of the models.</div>

          }

          this.realizar_comparacion = this.realizar_comparacion.bind(this);
    }

    componentDidMount(){
        console.log("Ventana comparación realizada.");
        var tipo_contenedor = null;
        var n_modelos = this.props.location.state.lista_modelos.length;
        var longitud = -1;
        var indice_malla = 0; 
        var ancho;

        if(n_modelos === 4){
            tipo_contenedor = "container-fluid card";
        }
        else{
            tipo_contenedor = "container card caja";
        }

        ancho = this.obtiene_ancho_columna(n_modelos);
        longitud = this.obtener_longitud_dataset();
        longitud = 100;
        console.log("LONGITUD FUERA---------------------------------->", longitud);
        indice_malla = this.genera_indice_malla_aleatorio(longitud);
        
        this.realizar_comparacion();
        
        this.reconstruir_varias_img(indice_malla);
        this.setState({tipo_contenedor : tipo_contenedor, indice_malla: indice_malla, ancho_columna: ancho});
    }


/*     comparacion = requests.get("http://127.0.0.1:8000/api_tomo/comparar_modelos/?dataset={}&lista_modelos={}&lista_metricas={}&postprocesar={}".format(
        id_dataset, lista_id_modelos,lista_metricas,postprocesar), 
        headers={'Authorization': 'Token {}'.format(request.session["token"])}).json() */



    obtiene_id_modelos(lista_modelos){
        var lista_ids = []
        for(var modelo of lista_modelos){
            lista_ids.push(parseInt(modelo.modelo_generico.id,10));//El segundo argumento es la base para realizar la conversión.
        }
        lista_ids.sort(function(a, b) {
            return a - b;
          })

        return lista_ids;
    }
    
    obtiene_ancho_columna(longitud){
        var ancho = 3;
        if(longitud === 2){
            ancho = 6;
        }
        else if(longitud === 3){
            ancho = 4;
        }
        else if(longitud === 4){
            ancho = 3;
        }
        return ancho;
    }

    realizar_comparacion(){
        console.log("Realizar comparacion.");
        console.log("LISTA MODELOS:", this.props.location.state.lista_modelos);
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        axios.get(this.props.location.state.url_base + "api_tomo/comparar_modelos/?dataset="+ this.props.location.state.dataset
                +"&lista_modelos="+ this.obtiene_id_modelos(this.props.location.state.lista_modelos)
                +"&lista_metricas="+ this.props.location.state.lista_metricas
                +"&postprocesar=" + this.props.location.state.postprocesar, config)
        .then(
            response => {
                console.log("ÉXITO EN LA COMPARACIÓN.");
                console.log("COMPARACIÓN A: ", response.data);


                this.setState({comparacion: response.data, lista_metricas: response.data.metricas, realizando_comparacion: false});
                console.log("COMPARACIÓN: ", response.data);
                //console.log(response.data[0].creador.username);
                //console.log("CREADOR: ", response.data[1])

            })
        .catch(error => {
            //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
            this.setState({error_modelo: true});
            console.error('Se ha producido un error.', error);
        });
    }



    obtener_longitud_dataset(){
        console.log("Obtener longitud dataset.");


        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }
        console.log("PASO 2------------------.");

        axios.get(this.props.location.state.url_base + "api_tomo/datasets/" + this.props.location.state.dataset + "/", config)
        .then(
            response => {
                console.log("Obtener LONGITUD DATASET.");
                console.log("UD DATASET ", response.data);
                console.log("LONGITUD DATASET ", response.data.n_mallas);
                return response.data.n_mallas;


            })
        .catch(error => {
            console.error('Se ha producido un error AL OBTENER LA LONGITUUUUUUUUUUUUUUUUUUUUUUUUUD  .', error);
        });
        console.log("DEVUELVE 0 SIN MÁS.")
    

        return 0;
    }


    genera_indice_malla_aleatorio(longitud){
        var min=0;
        var max=longitud; //El número generado aleatoriamente será menor que max.  
        console.log("MAX:", max);
        var random = Math.floor(Math.random() * (max - min + 1)) + min;

        console.log("RANDOM:", random);
        return random;
    }



    reconstruir_varias_img(indice_malla){
        console.log("Reconstruir imágenes.");

        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        axios.get(this.props.location.state.url_base + "api_tomo/reconstruir_img_multiple/?dataset="+ this.props.location.state.dataset
                +"&indice_malla=" + indice_malla
                +"&lista_modelos=" + this.obtiene_id_modelos(this.props.location.state.lista_modelos)
                +"&postprocesar=" + this.props.location.state.postprocesar, config)
        .then(
            response => {
                console.log("ÉXITO EN LA REC IMG.");
                console.log("REC IMG: ", response.data);
                this.setState({urls_imgs: response.data, realizando_reconstruccion: false});
                
                //console.log(response.data[0].creador.username);
                //console.log("CREADOR: ", response.data[1])

            })
        .catch(error => {
            console.error('Se ha producido un erroren REC IMG.', error);
        });
    }

    redondea_num(num){
        return Math.round((num + Number.EPSILON) * 100) / 100; //Number.Epsilon para números como 1.005
    }

    calcula_porcentaje(mc, tipo){
        var total = mc.verdaderos_positivos + mc.verdaderos_negativos + mc.falsos_positivos + mc.falsos_negativos;
        var porcentaje = 0;

        if(tipo === "vp"){
            porcentaje = (mc.verdaderos_positivos /total)*100;
        }
        else if(tipo === "vn"){
            porcentaje = (mc.verdaderos_negativos /total)*100;
        }
        else if(tipo === "fp"){
            porcentaje = (mc.falsos_positivos /total)*100;
        }
        else if(tipo === "fn"){
            porcentaje = (mc.falsos_negativos /total)*100;
        }
        
        var porcentaje_redondo = Math.round((porcentaje + Number.EPSILON) * 100) / 100;

        return porcentaje_redondo;
    }



    render(){
        console.log("Se ejecuta PRUEBA")
        var mensaje_modelo = "Alguno de los modelos seleccionados ya no se encuentra en el sistema.";
        if (this.state.error_modelo === true) {
            return <Redirect push to={{
                pathname: '/sin_modelo',
                state: { token: this.props.location.state.token, 
                        url_base: this.props.location.state.url_base,
                        mensaje: mensaje_modelo}
            }}/>        
        }

        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Cabecera con_cuenta = {true} mensaje_ayuda = {this.state.mensaje_ayuda} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <BotonAtras/>
                        {this.state.realizando_comparacion === true ||  this.state.realizando_reconstruccion === true ? (
                            <Cargar
                                completo = {true} 
                                cabecera = "Model comparison"
                                mensaje = "Performing comparison. This operation may take a few seconds."
                            />
                        ):(
                        <div>
                            <div className="card bg-light mx-auto mb-3 caja max_width_50">
                                <div className="card-header">Comparison</div>
                                <div className="card-body">
                                    <h5 className="card-title">Evaluation results </h5>
                                    <div className="row">
                                        <div className="col-md-12 width_14">
                                            <table className = "table table-striped">
                                                <thead>
                                                <tr>
                                                    <th scope="col">Model ID</th>
                                                    <th scope="col"> Type </th>
                                                    {this.props.location.state.lista_metricas.map((m, index) =>
                                                        <th scope="col" key = {index}>{m.toUpperCase()}</th>
                                                    )}
        
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.keys(this.state.comparacion.metricas).map((id_modelo) => 
                                                    <tr key = {id_modelo}> 
                                                    
                                                        <td><b>{id_modelo}</b></td>
                                                        <td>{this.state.comparacion.tipos[id_modelo]}</td>
                                                        {Object.keys(this.state.comparacion.metricas[id_modelo]).map((nombre_metrica) =>
                                                            <td key = {nombre_metrica}> 
                                                                {this.redondea_num(this.state.comparacion.metricas[id_modelo][nombre_metrica])}
                                                                {nombre_metrica === "accuracy" &&
                                                                    <div className = "en_linea">
                                                                        <span>%</span>
                                                                    </div>
                                                                }
                                                            
                                                            </td>
        
                                                        )} 
            
                                                    </tr>
                                                )}
            
                                            </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
        
                             {this.props.location.state.lista_metricas.includes("accuracy") &&
                                <div>
                                <div className = {this.state.tipo_contenedor}>
                                        <h5 className="card-title text-center">Confusion matrixes</h5>
                                        <div className="card-body">
                                            <div className="row" >
                                                {Object.keys(this.state.comparacion.matrices_confusion).map((id_modelo) =>
                                                    <div className={"col-md-" + this.state.ancho_columna + " width_14"} key = {id_modelo}>
        
                                                        <table className = "table table-bordered">
                                                            <caption className = "titulo_arriba"><b>Model {id_modelo}</b></caption>
                                                            <thead>
                                                                <tr>
                                                                    <th scope="col"></th>
                                                                    <th scope="col">Actual value (without artifact)</th>
                                                                    <th scope="col">Actual value (with artifact)</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <th> Prediction (without artifact) </th>
                                                                    <td> {this.state.comparacion.matrices_confusion[id_modelo].verdaderos_negativos} ({this.calcula_porcentaje(this.state.comparacion.matrices_confusion[id_modelo], "vn")}<span>%</span>)</td>
                                                                    <td> {this.state.comparacion.matrices_confusion[id_modelo].falsos_negativos} ({this.calcula_porcentaje(this.state.comparacion.matrices_confusion[id_modelo], "fn")}<span>%</span>)</td>
                                                                </tr>
                                                                <tr>
                                                                    <th> Prediction (with artifact)</th>
                                                                    <td> {this.state.comparacion.matrices_confusion[id_modelo].falsos_positivos} ({this.calcula_porcentaje(this.state.comparacion.matrices_confusion[id_modelo], "fp")}<span>%</span>)</td>
                                                                    <td> {this.state.comparacion.matrices_confusion[id_modelo].verdaderos_positivos} ({this.calcula_porcentaje(this.state.comparacion.matrices_confusion[id_modelo], "vp")}<span>%</span>)</td>
                                                                </tr>
                                                            </tbody>
                                                                             
        
                                                        </table>
                                                    </div>
                                                )}
        
        
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
        
                            <div className = "container card caja">
                                <h5 className="card-title text-center"> Reconstruction of random image from the dataset {this.props.location.state.dataset}: mesh {this.state.indice_malla}</h5>
                                <div className="card-body">
                                    <div className="row" >
                                        <div className="col-md-4"> </div>
                                        <div className="card col-md-4 caja width_14">
                                            <div className = "container">
                                                <p className="card-title text-center"><b>Actual image</b></p>
                                                <img className="card-img-top border border-dark img_rec text-center" src={"http://" + this.state.urls_imgs["url0"]} alt="Card image cap"/>
                                            </div>
                                        </div>
                                        <div className="col-md-4"> </div>
                                    </div>
                                    <br/>
        
                                    <div className="row" >
                                        {this.obtiene_id_modelos(this.props.location.state.lista_modelos).map((id_modelo, index) =>
                                            <div className={"card col-md-" + this.state.ancho_columna + " caja width_14"} key = {id_modelo}>
                                                <div className = "container">
                                                    <p className="card-title text-center"><b>Prediction of the model {id_modelo}</b></p>
                                                    <img className="card-img-top border border-dark img_rec text-center" src={"http://" + this.state.urls_imgs["url" + (index + 1)]} alt="Card image cap"/>
                                                </div>
                                            </div>
                                        )}
                                    </div>
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

export default ModelosComparacionRealizada;
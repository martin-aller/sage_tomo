import React, { Component } from 'react'
import Cabecera from '../gestion/Cabecera';
import BotonAtras from '../gestion/BotonAtras';
import SinSesion from '../gestion/SinSesion'
import ModalMatriz from '../gestion/ModalMatriz';
import axios from 'axios';
import {Redirect} from "react-router-dom";



class ModeloDetalles extends Component{
    //Vista con los detalles de un modelo particular.
    
    constructor(props){
        super(props);
        this.state = {
            modelo_generico: false,
            modelo_especifico: false,
            aDatasetDetalles: false,
            show_matriz: false,
            cargando: true,
            mensaje_ayuda: <div>En esta ventana se muestran todos los detalles del modelo seleccionado. El dataset que aparece entre los atributos del modelo
            es el dataset empleado para entrenar al modelo. Además, los valores de las métricas que se muestran son los calculados mediante el
            conjunto de test del dataset de entrenamiento.</div>
          }

    }

    componentDidMount(){
        this.get_detalles_modelo();
    }

    get_detalles_modelo(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        const id_modelo = this.props.match.params.id;
        console.log("ID del modelo: ", id_modelo);

        axios.get(this.props.location.state.url_base + "api_tomo/modelos/" + id_modelo + "/", config)
        .then(
            response => {
                console.log("Obtener detalles modelo.");
                this.setState({modelo_generico: response.data.modelo_generico, 
                               modelo_especifico: response.data.modelo_especifico, 
                               cargando: false});
                console.log(response.data);
                console.log("Verdaderos: ", this.state.modelo_generico.matriz_confusion.verdaderos_positivos);
                
            })
        .catch(error => {
            //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
            console.error('Se ha producido un error.', error);
        });
    }

    redondea_num(num){
        return Math.round((num + Number.EPSILON) * 100) / 100; //Number.Epsilon para números como 1.005
    }

    acceder_dataset_detalles(){
        this.setState({aDatasetDetalles:true});
    }

    setModal(estado){
        this.setState({show_matriz: estado});
    }

    formatea_datetime(datetime){
        var datetime_formateado = "";
        datetime_formateado = datetime.replace("T", ", ");
        datetime_formateado = datetime_formateado.replace("Z", "").split(".")[0];
        return datetime_formateado;
    }


    render(){
        console.log("Se ejecuta Modelos Detalles");

        if (this.state.aDatasetDetalles === true) {
            return <Redirect push to={{
                pathname: '/datasets/' + this.state.modelo_generico.dataset,
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }


        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Cabecera con_cuenta = {true} mensaje_ayuda = {this.state.mensaje_ayuda} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <BotonAtras/>
        
                    {this.state.show_matriz &&
                      <ModalMatriz
                      show = {this.state.show_matriz}
                      mc = {this.state.modelo_generico.matriz_confusion}
                      cerrar = {() => this.setModal(false)}   
                      />       
                    }
        
                        {this.state.cargando === true ? (
                            <div className="row" id = "cargar">
                                <div className = "col text-center">
                                    <div className="spinner-border text-dark cargador" role="status">
                                    </div>
                                </div>
                            </div>
                        ) : (
        
                            <div className = "container">
                                <div className = "row">
                                    <div className="card col-md-6 caja" >
                                        <div className="card-body ">
                                            <h5 className="card-title">General information </h5>
                                             <table className = "table table-striped" >
                                                 <tbody>
                                                     <tr>
                                                         <th scope="row">Id: </th>
                                                         <td>{this.state.modelo_generico.id}</td>
                                                     </tr>
                                                     <tr>
                                                         <th scope="row">Type: </th>
                                                         <td>{this.state.modelo_generico.tipo}</td>
                                                     </tr>
                                                     <tr>
                                                         <th scope="row">Used dataset ID: </th>
                                                         <td>{this.state.modelo_generico.dataset} 
                                                             <span  className="btn-sm btn-dark float-right dataset_de_modelo cursor_puntero" onClick = {() => this.acceder_dataset_detalles()}>
                                                                 View information
                                                             </span>
                                                         </td>
                                                     </tr>
        
                                                     <tr>
                                                         <th scope="row">Creation date: </th>
                                                         <td>{this.formatea_datetime(this.state.modelo_generico.fecha_hora_inicio)}</td>
                                                     </tr>
        
                                                     {this.state.modelo_generico.fecha_hora_fin !== null &&
                                                         <tr>
                                                             <th scope="row">Training time: </th>
                                                             <td>{this.state.modelo_generico.tiempo_entrenamiento}</td>
                                                         </tr>                                                
                                                     }
                                     
                                                     <tr>
                                                         <th scope="row">Additional comments: </th>
                                                         <td>{this.state.modelo_generico.comentarios_adicionales}</td>
                                                     </tr>
                                                     <tr>
                                                         <th scope="row">Creator: </th>
                                                         <td>{this.state.modelo_generico.creador.username}</td>
                                                     </tr>
                                                     <tr>
                                                        <th scope="row">Visibility: </th>
                                                        {this.state.modelo_generico.visible === true ? (
                                                            <td>Public</td>
                                                        ):(
                                                            <td>Private</td>
                                                        )}
                                                    </tr>
                                                 </tbody>
                                             </table>
                                        </div>
                                    </div>
        
                                    {/*RED NEURONAL*/}
                                    {this.state.modelo_generico.tipo === "DNN" &&
                                        <div className="card col-md-6 caja" >
                                            <div className="card-body ">
                                              <h5 className="card-title">Neural Network details </h5>
                                                  <table className = "table table-striped" >
                                                        <tbody>
                                                          <tr>
                                                              <th scope="row">Number of hidden layers: </th>
                                                              <td>{this.state.modelo_especifico.capas_ocultas}</td>
                                                          </tr>
                                                          <tr>
                                                                <th scope="row">Number of neurons per hidden layer: </th>
                                                              <td>
                                                                  <ul>
                                                                      {this.state.modelo_especifico.neuronas_por_capa.map((nc, index) =>
                                                                            <li key = {index}>Hidden layer {index} &rarr; &nbsp; <b>{nc}</b></li>
                                                                      )}
        
                                                                  </ul>
                                                              </td>
                                                            </tr>
                                                          <tr>
                                                                <th scope="row">Activation function for the hidden layers: </th>
                                                              <td>{this.state.modelo_especifico.funcion_activacion_interna}</td>
                                                          </tr>
                                                          <tr>
                                                              <th scope="row">Activation function for the output layer: </th>
                                                              <td>{this.state.modelo_especifico.funcion_activacion_salida}</td>
                                                          </tr>
                                                          <tr>
                                                                <th scope="row">Error function: </th>
                                                              <td>{this.state.modelo_especifico.funcion_error}</td>
                                                          </tr>
                                                          <tr>
                                                                <th scope="row">Number of epochs: </th>
                                                              <td>{this.state.modelo_especifico.epocas}</td>
                                                          </tr>
                                                          <tr>
                                                                <th scope="row">Batch size: </th>
                                                              <td>{this.state.modelo_especifico.lotes}</td>
                                                          </tr>
                                                              <tr>
                                                                  <th scope="row" > Metrics: </th>
                                                                  <td>
                                                                      <ul>
                                                                          {this.state.modelo_generico.metricas.map((m) =>
                                                                                <li key = {m.nombre_metrica}> 
                                                                                    <b>{m.nombre_metrica}</b> : {this.redondea_num(m.valor_metrica)}
                                                                                        {m.nombre_metrica === "acierto" &&
                                                                                            <div className = "en_linea">
                                                                                                <span>%</span>
                                                                                                <p className ="btn btn-dark btn-sm" onClick = {() => this.setModal(true)}> View confusion matrix</p>                                                                   
                                                                                            </div>
        
                                                                                        }
                                                                                </li>                                                                 
                                                                          )}
                                                                      </ul>
                                                                  </td>
                                                              </tr>
                                                            <tr>
                                                                <th scope="row" > Postprocessing threshold: </th>
                                                                <td>{this.redondea_num(this.state.modelo_generico.umbral_postprocesado)}</td>
                                                            </tr>
                                                        </tbody>
                                                  </table>
                                            </div>
                                          </div>
                                    }
        
        
                                    {/*RANDOM FOREST*/}
        
                                    {this.state.modelo_generico.tipo === "RF" &&
                                        <div className="card col-md-6 caja" >
                                        <div className="card-body ">
                                            <h5 className="card-title">Random Forest details</h5>
                                                <table className = "table table-striped" >
                                                    <tbody>
                                                        <tr>
                                                            <th scope="row">Number of estimators: </th>
                                                            <td>{this.state.modelo_especifico.n_estimadores}</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Maximum depth: </th>
                                                            <td>{this.state.modelo_especifico.profundidad_max}</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Minimum number of samples to split: </th>
                                                            <td>{this.state.modelo_especifico.min_samples_split}</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Minimum number of samples to be at a leaf node: </th>
                                                            <td>{this.state.modelo_especifico.min_samples_leaf}</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row" > Metrics: </th>
                                                            <td>
                                                                <ul>
                                                                    {this.state.modelo_generico.metricas.map((m) =>
                                                                            <li key = {m.nombre_metrica}> 
                                                                                <b>{m.nombre_metrica}</b> : {this.redondea_num(m.valor_metrica)}
                                                                                    {m.nombre_metrica === "acierto" &&
                                                                                        <div className = "en_linea">
                                                                                            <span>%</span>
                                                                                            <p className ="btn btn-dark btn-sm" onClick = {() => this.setModal(true)}> View confusion matrix</p>                                                                   
                                                                                        </div>
        
                                                                                    }
                                                                            </li>                                                                 
                                                                    )}
                                                                </ul>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row" > Postprocessing threshold: </th>
                                                            <td>{this.redondea_num(this.state.modelo_generico.umbral_postprocesado)}</td>
                                                        </tr>
        
                                                    </tbody>
                                                </table>
                                        </div>
                                        </div>                            
                                    }
        
                                    {/*MÁQUINA DE SOPORTE VECTORIAL*/}
        
                                    {this.state.modelo_generico.tipo === "SVM" &&
                                        <div className="card col-md-6 caja" >
                                        <div className="card-body ">
                                            <h5 className="card-title">Support Vector Machine details </h5>
                                                <table class = "table table-striped" >
                                                    <tbody>
                                                        <tr>
                                                            <th scope="row">Kernel: </th>
                                                            <td>{this.state.modelo_especifico.kernel}</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Degree: </th>
                                                            <td>{this.state.modelo_especifico.grado}</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Gamma: </th>
                                                            <td>{this.state.modelo_especifico.gamma}</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Coefficient 0: </th>
                                                            <td>{this.state.modelo_especifico.coef0}</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Tolerance: </th>
                                                            <td>{this.state.modelo_especifico.tol}</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">C: </th>
                                                            <td>{this.state.modelo_especifico.c}</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Epsilon: </th>
                                                            <td>{this.state.modelo_especifico.epsilon}</td>
                                                        </tr>
        
                                                                <tr>                                                
                                                                    <th scope="row" > Metrics: </th>
                                                                    <td>
                                                                        <ul>
                                                                            {this.state.modelo_generico.metricas.map((m) =>
                                                                                    <li key = {m.nombre_metrica}> 
                                                                                        <b>{m.nombre_metrica}</b> : {this.redondea_num(m.valor_metrica)}
                                                                                            {m.nombre_metrica === "acierto" &&
                                                                                                <div className = "en_linea">
                                                                                                    <span>%</span>
                                                                                                    <p className ="btn btn-dark btn-sm" onClick = {() => this.setModal(true)}> View confusion matrix</p>                                                                   
                                                                                                </div>
                
                                                                                            }
                                                                                    </li>                                                                 
                                                                            )}
                                                                        </ul>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <th scope="row" > Postprocessing threshold: </th>
                                                                    <td>{this.redondea_num(this.state.modelo_generico.umbral_postprocesado)}</td>
                                                                </tr>
        
                                                    </tbody>
                                                </table>
                                        </div>
                                        </div>
                                
                                    }
        
        
        
        
        
        
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

export default ModeloDetalles;
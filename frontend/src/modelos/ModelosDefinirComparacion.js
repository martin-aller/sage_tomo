import React, { Component } from 'react'
import Cabecera from '../gestion/Cabecera';
import BotonAtras from '../gestion/BotonAtras';
import SinSesion from '../gestion/SinSesion'
import {Redirect} from "react-router-dom";
import axios from 'axios';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

class ModelosDefinirComparacion extends Component{
     //Vista con un formulario para definir los parámetros de comparación
     //de varios modelos.
    constructor(props){
        super(props);
        this.state = {
            lista_modelos : [],
            lista_datasets : [],
            id_dataset : null,
            id_dat_detalles: null,
            aComparacionRealizada: false,
            tipo_contenedor: null,
            cargando_datasets: true,
            postprocesado: true,
            error_dataset: false,
            lista_metricas : [],
            mensaje_ayuda: <div>In this window you can define certain parameters to define the comparison between the models selected 
                in the previous window. The comparisons between models consist of making predictions of the conductivity values for 
                all the meshes from a dataset and evaluating the predictions made by calculating one or more metrics. You can choose 
                the dataset to be used to evaluate the models, as well as the metrics by which the models will be evaluated. Moreover, 
                you can indicate whether you want to apply post-processing to the predictions made by the models.</div>
            
          }
        this.handleChangePostprocesado = this.handleChangePostprocesado.bind(this);

    }


    handleChangePostprocesado(event){
        if(this.state.postprocesado === "True"){
            this.setState({postprocesado:"False"});
        }else if(this.state.postprocesado === "False"){
            this.setState({postprocesado:"True"});
        }
    }

    componentDidMount(){
        var tipo_contenedor_aux;
        this.consultar_modelos();
        this.get_datasets();
        if(this.props.location.state.lista_modelos.length === 2){
            tipo_contenedor_aux = "container";
        }else{
            tipo_contenedor_aux = "container-fluid";
        }
        this.setState({tipo_contenedor: tipo_contenedor_aux});
    }

    ver_detalles_dataset(id){
        this.setState({id_dat_detalles : id});
    }

    consultar_modelos(){
        var lista_modelos_aux = [];
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }
        console.log("Llega aquí CONSULTAR");
        for(var id_modelo of this.props.location.state.lista_modelos){
            axios.get(this.props.location.state.url_base + "api_tomo/modelos/" + id_modelo + "/", config)
            .then(
                response => {
                    console.log("Modelo obtenido.");
                    //this.setState({lista_modelos: response.data, cargando: false});
                    console.log(response.data);
                    lista_modelos_aux.push(response.data);
                    //console.log(response.data[0].creador.username);
                    //console.log("CREADOR: ", response.data[1])
    
                })
            .catch(error => {
                //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
                console.error('Se ha producido un error.', error);
            });
        }

        console.log(lista_modelos_aux);
        this.setState({lista_modelos: lista_modelos_aux});

    }

    seleccionar_dataset(id){
        this.setState({id_dataset: id});
    }

    abre_metricas(){
        document.getElementById("dropdown-menu-metricas").classList.toggle("show");
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
                this.setState({lista_datasets: response.data, cargando_datasets: false});
                console.log(response.data);
                //console.log(response.data[0].creador.username);
                //console.log("CREADOR: ", response.data[1])

            })
        .catch(error => {
            //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
            console.error('Se ha producido un error.', error);
        });
    }



    obtiene_fecha(datetime){
        var fecha = "";
        fecha = datetime.split("T")[0];
        return fecha;
    }



    render(){
        console.log("Entrenar DNN")

        if (this.state.aComparacionRealizada === true) {
            console.log("LLEGA HASTA AQUÍ PRINCIPAL");
            return <Redirect push to={{
                pathname: '/modelos_comparacion_realizada',
                state: { dataset: this.state.id_dataset,
                         lista_modelos: this.state.lista_modelos,
                         lista_metricas: this.state.lista_metricas,
                         postprocesar: this.state.postprocesado,
                         token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }


        if (this.state.id_dat_detalles !== null) {
            return <Redirect push to={{
                pathname: '/datasets/' + this.state.id_dat_detalles,
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Cabecera con_cuenta = {true} mensaje_ayuda = {this.state.mensaje_ayuda} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <BotonAtras/>
        
                        <h3 className = "text-center"> Models to compare: </h3>
                        <br/><br/>
                        <div className = {this.state.tipo_contenedor}> {/*Si hay al menos tres modelos, el contenedor será fluido, para que quepan en la misma línea.*/}
                            <div className = "row">
                                {this.state.lista_modelos.map((m) =>
                                    <div className="card bg-light mx-auto mb-3 caja max_width_50" key = {m.modelo_generico.id}>
                                        <div className="card-body">
                                            <h5 className="card-title">Model {m.modelo_generico.id}</h5>
                                            <p className = "text-left"><b>Type</b>: {m.modelo_generico.tipo} </p>
                                            <p className = "text-left"><b>Training dataset</b>: {m.modelo_generico.dataset} </p>
                                        </div>
                                    </div>                        
                                )}
        
                            </div>
        
                        </div>
                        <br/>
                        <div className = "container" >
                            {this.state.lista_modelos.map((m)=>
                                <input type="hidden" name="lista_modelos" value = {m.modelo_generico.id} key = {m.modelo_generico.id}/>
        
                            )}
                            <div className="card bg-light mx-auto mb-3 caja max_width_50">
                                <div className="card-header">Comparison options</div>
                                <div className = "card-body">
                                    <div className = "row">
                                        <div className="col-md-12">
                                            <p className = "text-left"> Select a <b>dataset</b> to evaluate the models: </p>
                                            <br/>
                                        </div>
                                    </div>
                                    <div className = "row">
                                        <div className="col-md-12">
                                            {this.state.cargando_datasets === true ? (
                                                <div className="row" id = "cargar">
                                                    <div className = "col text-center">
                                                        <div className="spinner-border text-dark cargador" role="status">
                                                        </div>
                                                    </div>
                                                </div>
                                            ):(
                                                <table className = "table table-striped tabla_scroll_x tabla_scroll_y_20">
                                                    <thead>
                                                        <tr>
                                                            <th scope="col" className = "ancho_col"></th>
                                                            <th scope="col" className = "ancho_col">Id </th>
                                                            <th scope="col" className = "ancho_col">Creator </th>
                                                            <th scope="col" className = "ancho_col">Creation date </th>
                                                            <th scope="col" className = "ancho_col">Number of meshes </th>
                                                            <th scope="col" className = "ancho_col"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                            {this.state.lista_datasets.map( (dataset) =>
                                                                <tr key = {dataset.id}>
                                                                    <td><input type="radio" name = "lista_datasets" value = {dataset.id} 
                                                                        onClick = {() => this.seleccionar_dataset(dataset.id)}/>
                                                                    </td>
                                                              
                                                                    <th scope="row" >{dataset.id}</th>
                                                                    <td>{dataset.creador.username}</td>
                                                                    <td>{this.obtiene_fecha(dataset.fecha_creacion)}</td>
                                                                    <td>{dataset.n_mallas}</td>
                                                                    <td> <span className = "btn-link cursor_puntero" onClick = {() => this.ver_detalles_dataset(dataset.id)}> View details</span> </td>
                                                                </tr>
                                                            )}
                                                    </tbody>
                                                </table>
                                            )}
                                            {this.state.error_dataset && 
                                                <div className = "row text-center margin_top_2">
                                                    <div className = "col-md-3"></div>
                                                    <div className="col-md-6">
                                                        <div className="alert alert-danger">
                                                            <p>No has seleccionado ningún dataset.</p>
                                                        </div>                                
                                                    </div>
                                                    <div className = "col-md-3"></div>
                                                </div>
                                            }                          
                                        </div>
                                    </div>
                                    <hr/>
                                    <div className = "row">
                                        <div className="col-md-9">
                                            <br/><br/>
                                            <p className = "text-left"> Indicate if you want to <b>postprocess</b> the predictions made by the models: </p>
                                            <br/>
                                        </div>
        
                                        <div className="col-md-3">
                                            <br/><br/>
                                                    <label>Yes <input type="radio" name = "postprocesar" value="True" className = "width_3" onChange = {this.handleChangePostprocesado}  defaultChecked/> </label>
                                                    <label>No<input type="radio" name = "postprocesar" value="False" className = "width_3" onChange = {this.handleChangePostprocesado}  />  </label>
                                            <br/>
                                        </div>
                                    </div>
        
                                    <hr/>
        
                                  
                                            
                                    <Formik
                                            initialValues={{ metricas: []}}
                                            validationSchema={Yup.object({
                                            metricas: Yup.array().min(1, 'You must select at least two metrics'),
                                
                                            })}
                                            onSubmit={(values, { setSubmitting }) => {
                                            setTimeout(() => {
                                                this.setState({error_dataset: false});
                                                if(this.state.id_dataset === null){
                                                    this.setState({error_dataset: true});
                                                }else{
                                                    this.setState({lista_metricas: values.metricas, aComparacionRealizada: true});
                                                }   
                                                console.log("INTERVALOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO");
                                                //alert(JSON.stringify(values, null, 2));
                                                console.log("VALOR: ", values);
                                                //this.generar_dataset(values);
                                                setSubmitting(false);
                                            });
                                            }}>
                                        <Form >
                                            <div className = "row">
                                                <div className="col-md-9">
                                                    <br/>
                                                    <p className = "text-left"> Select the <b>metrics</b> by which the models will be assessed: </p>
                                                    <br/><br/>
                                                </div>
        
                                                
                                                    <div className = "col-md-3">
                                                        <br/>
                                                        <div className="dropdown" id = "dropdown_metricas" name = "dropdown_metricas" >
                                                            <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu2" 
                                                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" onClick = {() => this.abre_metricas()}>
                                                                Choose one or more
                                                            </button>
                                                            <div className="dropdown-menu" id = "dropdown-menu-metricas" aria-labelledby="dropdownMenu2">
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <Field type="checkbox" name = "metricas" value = "mse" /> Mean Squared Error
                                                                    </label>
                                                                </div>
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <Field type="checkbox" name = "metricas" value = "accuracy" /> Accuracy
                                                                    </label>
                                                                </div>
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <Field type="checkbox" name = "metricas" value = "mean_absolute_error"/> Mean Absolute Error
                                                                    </label>
                                                                </div>
        
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <Field type="checkbox" name = "metricas" value = "mean_squared_logarithmic_error"/> Mean Squared Logarithmic Error
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className = "error1"><ErrorMessage  name="metricas" /> </span>
        
                                                    </div>
                                                
                                            </div>
                                            {/* {% if seleccionar_metricas %}
                                                <div className="alert alert-danger" role="alert">
                                                    Selecciona al menos <b> una </b> métrica para realizar la comparación.
                                                </div>
                                                <script> window.scrollTo(0,document.body.scrollHeight); </script>
                                            {%endif%} */}
                                            <div className = "row">
                                                <div className="col-md-12 text-center">
                                                    <button type = "submit" className = "btn-lg btn-dark" id = "btn_definir_comparacion" >
                                                        Compare models
                                                    </button>
                                                </div>
                                            </div>
                                        </Form>
                                    </Formik>
        
                                    
        
        
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

export default ModelosDefinirComparacion;
import React, { Component } from 'react'
import Cabecera from '../gestion/Cabecera';
import BotonAtras from '../gestion/BotonAtras';
import SinSesion from '../gestion/SinSesion'
import Cargar from '../gestion/Cargar'
import {Redirect} from "react-router-dom";
import { Formik, Field, Form, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';


class EntrenarDNN extends Component{
    //Vista con un formulario para definir los parámetros de entrenamiento de
    //una red neuronal.

    constructor(props){
        super(props);
        this.state = {
            aEntrenamientos: false,
            aDatasetsEntrenamiento: false,
            numero_capas: 1,
            id_dataset: null,
            mensaje_ayuda: <p>En esta ventana puedes definir las características de la red neuronal que entrenarás.</p>,
            

          }
    }


    componentDidMount(){
        if(this.props.location.state !== undefined && "id_dataset" in  this.props.location.state){
            this.setState({id_dataset: this.props.location.state.id_dataset});
        }else{
            this.get_datasets_menor();
        }
    }

    abre_metricas(){
        document.getElementById("dropdown-menu-metricas").classList.toggle("show");
    }

    acceder_datasets_train(){
        this.setState({aDatasetsEntrenamiento:true});
    }


    ocultar_mostrar_lotes(){
        var marcado = document.getElementById("entrenamiento_lotes").checked;
        if(marcado == false){
            document.getElementById("fila_lotes").setAttribute("hidden", true);
        }else{
            document.getElementById("fila_lotes").removeAttribute("hidden");
        }
    }


    iniciar_entrenamiento_dnn(values){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }
        console.log("VALORES: ", values);

        var lotes_aux = null;

        if(values.entrenamiento_lotes.length > 0){
            lotes_aux = values.tamanho_lotes;
        }
        const par = {
            dataset: this.state.id_dataset,
            n_capas_ocultas: values.neuronas_por_capa.length,
            n_neuronas: values.neuronas_por_capa,
            funcion_activacion_interna: values.f_activacion_interna,
            funcion_activacion_salida: values.f_activacion_externa,
            funcion_error: values.f_error,
            n_epocas: values.n_epocas,
            tamanho_lotes: lotes_aux,
            learning_rate: values.learning_rate,
            momentum: values.momentum,
            metricas: values.metricas,
            comentarios: values.comentarios,
            visibilidad: values.visibilidad,

        }



        console.log("PAR: ", par);


        axios.post(this.props.location.state.url_base + "api_tomo/entrenar_dnn/", par, config)
        .then(
            response => {
                console.log("Generar datasets.");
                this.setState({aEntrenamientos: true});
                console.log(response.data);
            })
        .catch(error => {
            //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
            console.error('Se ha producido un error.', error);
        }); 
    }

    get_datasets_menor(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        axios.get(this.props.location.state.url_base + "api_tomo/datasets/", config)
        .then(
            response => {
                this.setState({id_dataset: response.data[response.data.length - 1].id});
            })
        .catch(error => {
            //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
            console.error('Se ha producido un error.', error);
        });
    }

    render(){
        console.log("Entrenar DNN")

        if (this.state.aEntrenamientos === true) {
            return <Redirect push to={{
                pathname: '/tareas_modelos',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        if (this.state.aDatasetsEntrenamiento === true) {
            return <Redirect push to={{
                pathname: '/datasets_entrenamiento',
                state: { url_regreso: "/entrenar_dnn",
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
                            <div className="card caja">
                                    <div className="card-header"> Train model </div>
                                    <div className="card-body" >
                                        <h5 className="card-title">Neural Network</h5>
                                        
                                    <Formik
                                        initialValues={{n_capas_ocultas : 1, neuronas_por_capa : [10], f_activacion_interna: 'relu', f_activacion_externa: 'relu', f_error: 'mse', 
                                            n_epocas : 20, 
                                             entrenamiento_lotes : '', tamanho_lotes: 64,learning_rate: 0.001,momentum: 0.9,
                                            metricas: ['mse', 'acierto'], visibilidad: 'True', comentarios: ''}}
                                        validationSchema={Yup.object({
        
                                        neuronas_por_capa: Yup.array()
                                            .of( Yup.number("Introduce un número entero positivo.")
                                                .positive("Debe ser un número positivo.")
                                                .integer("Debe ser un número entero.")
                                                .min(1, 'El número mínimo permitido de neuronas por capa  es 1.')
                                                .max(1000, 'El número máximo permitido de neuronas por capa es 1000.')
                                              // Rest of your amenities object properties
                                            ),
        
                                        f_activacion_interna: Yup.string()
                                            .required('Campo requerido.'),
                                        f_activacion_externa: Yup.string()
                                            .required('Campo requerido.'),
                                        f_error: Yup.string()
                                            .required('Campo requerido.'),
                                        n_epocas: Yup.number()
                                            .positive("Debe ser un número positivo.")
                                            .integer("Debe ser un número entero.")
                                            .min(1, 'El número mínimo de épocas permitido es 1.')
                                            .max(1000, 'El número máximo permitido de épocas es 1000.')
                                            .required('Campo requerido.'),
        
                                        tamanho_lotes: Yup.number()
                                            .positive("Debe ser un número positivo.")
                                            .integer("Debe ser un número entero.")
                                            .min(1, 'El tamaño mínimo permitido es 1.')
                                            .max(100, 'El tamaño máximo permitido es 100.'),
                                            
                                        learning_rate: Yup.number()
                                            .positive("Debe ser un número positivo.")
                                            .min(0.001, 'El valor mínimo permitido es 0.001.')
                                            .max(99999999, 'El valor mínimo permitido es 100.0.')
                                            .required('Campo requerido.'),
                                        momentum: Yup.number()
                                            .positive("Debe ser un número positivo.")
                                            .min(0.0, 'El valor mínimo permitido es 0.0.')
                                            .max(100, 'El valor máximo permitido es 100.0.')
                                            .required('Campo requerido.'),
                                        visibilidad: Yup.string()
                                            .required('Campo requerido.'),
                                        comentarios: Yup.string()
                                            .max(100, 'El comentario no puede superar los 100 caracteres.')
                                        
                                        })}
                                        onSubmit={(values, { setSubmitting }) => {
                                        setTimeout(() => {
                                            //alert("HOLAAA")
                                            console.log("HOLAAAAAAAAA");
                                            //alert(JSON.stringify(values, null, 2));
                                            console.log("VALOR: ", values);
                                            this.iniciar_entrenamiento_dnn(values);
                                            setSubmitting(false);
                                        });
                                        }}>
                                        <Form className = "row">
                                            {/*Columna izquierda*/}
                                            <div className="col-md-6 columna_izquierda_entrenar">
                                                        
                                                {this.state.id_dataset === null ? (
                                                    <Cargar completo = {false}/>
                                                ):(
                                                    <div>
                                                        <div className="form-group row">
                                                            <label htmlFor="dataset" className="col-sm-6 col-form-label"> Select dataset: </label>
                                                            <div className="col-sm-6 top_0_3">
                                                                <input type="button" className="btn-sm btn-dark  mb-2"
                                                                id = "btn_entrenar width_15" value = "Select dataset" onClick = {() => this.acceder_datasets_train()}/> 
                                                            </div>
                                                        </div>
                
                                                        
                                                        <div className="form-group row">
                                                            <label htmlFor="dataset_seleccionado" className="col-sm-6 col-form-label"> Selected dataset (ID): </label>
                                                            <div className="col-sm-6 top_0_4" >
                                                
                                                                    <b className = " borde_visible">{this.state.id_dataset}</b>                                                     
                                                            </div>
                                                        </div>
                                                    </div>

                                                )}

                                            
        
        
        
                                                <div className="form-group row">
                                                    <label htmlFor="neuronas_por_capa" className="col-sm-6 col-form-label"> Number of neurons per hidden layer: </label>
                                                    <div className="col-sm-6">
                                                        <FieldArray className="form-control"  name="neuronas_por_capa">
                                                            {
                                                                (fieldArrayProps) =>{
                                                                    console.log("Propiedades:", fieldArrayProps)
                                                                    const {push, remove, form} = fieldArrayProps
                                                                    const {values} = form
                                                                    const { neuronas_por_capa} = values
                                                                    return (
                                                                        <div>
                                                                            <button type = "button" className = "btn-sm btn-dark btn_neurona"  onClick = { () => form.values.neuronas_por_capa.length < 3 && push("")}> Add layer</button>
        
                                                                            {
                                                                                neuronas_por_capa.map((n_capa, index) => (
        
                                                                                    <div key = {index}>
                                                                                        <label><b>C{index}</b> &rarr; &nbsp; <Field name = {'neuronas_por_capa[' + index + ']'} className = "campo_neurona" type = "number"/></label>
                                                                                        {index > 0 && index < 3 &&
                                                                                                <button type = "button"  onClick = {() => remove(index)} > - </button>
                                                                                        }
                                                                                        
        
                                                                                        
                                                                                    </div>
                                                                                ))
                                                                            }
                                                                        </div>)
                                                                }
                                                            }
                                                        </FieldArray>
                                                        <span className = "error1"><ErrorMessage  name="neuronas_por_capa" /> </span>
        
                                                    </div>
                                                </div>
        
        
                                                <div className="form-group row">
                                                    <label htmlFor="funcion_activacion_interna" className="col-sm-6 col-form-label"> Activation function for hidden layers: </label>
                                                    <div className="col-sm-6">
                                                        <Field className="form-control" name="funcion_activacion_interna" as = "select">
                                                            <option value = "relu"> Rectified Linear Unit (ReLU) </option>
                                                            <option value = "tanh"> Hyperbolic tangent </option>
                                                            <option value = "sigmoid"> Sigmoid </option>
                                                            <option value = "exponential"> Exponential </option>
                                                            <option value = "linear"> Linear </option>
                                                        </Field>
                                                        <span className = "error1"><ErrorMessage  name="funcion_activacion_interna" /> </span>
        
                                                    </div>
                                                </div>
        
        
            
        
                                                <div className="form-group row">
                                                    <label htmlFor="funcion_activacion_salida" className="col-sm-6 col-form-label"> Activation function for output layer: </label>
                                                    <div className="col-sm-6">
                                                        <Field className="form-control"  name="funcion_activacion_salida" as = "select" >
                                                            <option value = "relu"> Rectified Linear Unit (ReLU) </option>
                                                            <option value = "tanh"> Hyperbolic tangent </option>
                                                            <option value = "sigmoid"> Sigmoid </option>
                                                            <option value = "exponential"> Exponential </option>
                                                            <option value = "linear"> Linear </option>
                                                        </Field>
                                                        <span className = "error1"><ErrorMessage  name="funcion_activacion_salida" /> </span>
        
                                                    </div>
                                                </div>
        
                                                <div className="form-group row">
                                                    <label htmlFor="funcion_error" className="col-sm-6 col-form-label"> Error function: </label>
                                                    <div className="col-sm-6">
                                                        <Field className="form-control" name="funcion_error" as = "select">
                                                            <option value = "mse"> Mean Squared Error </option>
                                                            <option value = "mean_absolute_error"> Mean Absolute Error </option>
                                                            <option value = "mean_absolute_percentage_error"> Mean Absolute Percentage Error </option>
                                                            <option value = "mean_squared_logarithmic_error"> Mean Squared Logarithmic Error </option>
                                                        </Field>
                                                        <span className = "error1"><ErrorMessage  name="funcion_error" /> </span>
        
                                                    </div>
        
                                                </div>
        
                                                <div className="form-group row">
                                                    <label htmlFor="n_epocas" className="col-sm-6 col-form-label"> Number of epochs: </label>
                                                    <div className="col-sm-6">
                                                        <Field type = "number" className="form-control" name="n_epocas"/>
                                                        <span className = "error1"><ErrorMessage  name="n_epocas" /> </span>
                                                    </div>
                                                </div>
                                            </div>
        
                                            
                                            {/*Columna derecha*/}
                                            <div className="col-md-6">
                                                <div className="form-group row">
                                                    <label htmlFor="entrenamiento_lotes" className="col-sm-6 col-form-label"> Use batches: </label>
                                                    <div className="col-sm-6">
                                                        <div className="dropdown margin_top_0_5" >
                                                            <Field type="checkbox" value = "True" id = "entrenamiento_lotes" name = "entrenamiento_lotes" onClick = {() => this.ocultar_mostrar_lotes()}/>
                                                            <span className = "font_size_0_9"> (Check the box if you want to use batches )</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-group row" id = "fila_lotes" hidden>
                                                    <label htmlFor="tamanho_lotes" className="col-sm-6 col-form-label"> Batch size: </label>
                                                    <div className="col-sm-6">
                                                        <Field type = "number" className="form-control" name="tamanho_lotes"/>
                                                        <span className = "error1"><ErrorMessage  name="tamanho_lotes" /> </span>
        
                                                    </div>
                                                </div>
        
                                                <div className="form-group row">
                                                    <label htmlFor="learning_rate" className="col-sm-6 col-form-label"> Learning rate: </label>
                                                    <div className="col-sm-6">
                                                        <Field type = "number" className="form-control" name="learning_rate"  step = "0.001"/>
                                                        <span className = "error1"><ErrorMessage  name="learning_rate" /> </span>
        
                                                    </div>
                                                </div>
        
                                                <div className="form-group row">
                                                    <label htmlFor="learning_rate" className="col-sm-6 col-form-label"> Momentum: </label>
                                                    <div className="col-sm-6">
                                                        <Field type = "number" className="form-control" name="momentum"  step = "0.1"/>
                                                        <span className = "error1"><ErrorMessage  name="momentum" /> </span>
        
                                                    </div>
                                                </div>
        
                                                <div className="form-group row">
                                                    <label htmlFor="dropdown_metricas" className="col-sm-6 col-form-label"> Metric selection: </label>
                                                    <div className="col-sm-6">
                                                        <div className="dropdown" id = "dropdown_metricas" name = "dropdown_metricas" >
                                                            <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu2" 
                                                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" onClick = {() => this.abre_metricas()}>
                                                                Choose one or more
                                                            </button>
                                                            <div className="dropdown-menu" id = "dropdown-menu-metricas" aria-labelledby="dropdownMenu2">
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <Field type="checkbox" name = "metricas" value = "mse" checked onclick="return false;"/> Mean Squared Error (required)
                                                                    </label>
                                                                </div>
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <Field type="checkbox" name = "metricas" value = "acierto" checked onclick="return false;"/> Accuracy (required)
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
                                                    </div>
                                                </div>
        
                                                <div className="form-group row">
                                                    <label htmlFor="visibilidad" className="col-sm-6 col-form-label"> Visible:</label>
                                                    <div className="col-sm-6">
                                                        <Field className="form-control width_10" as = "select" name="visibilidad">
                                                            <option value="True">Yes</option>
                                                            <option value="False">No</option>
                                                        </Field>
                                                        <span className = "error1"><ErrorMessage  name="visibilidad" /> </span>
                                                    </div>
                                                </div>
        
                                                <div className="form-group row">
                                                    <label htmlFor="comentarios" className="col-sm-6 col-form-label"> Additional comments: </label>
                                                    <div className="col-sm-6">
                                                        <Field component = "textarea" className="form-control" name = "comentarios" />
                                                        <span className = "error1"><ErrorMessage  name="comentarios" /> </span>
                                                    </div>
                                                </div>
                                                <div className = "text-center margin_top_6">
                                                    <button type="submit" className="btn-lg btn-dark  mb-2" id = "btn_entrenar" > Start training </button>
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

export default EntrenarDNN;
import React, { Component } from 'react'
import Cabecera from '../gestion/Cabecera';
import BotonAtras from '../gestion/BotonAtras';
import SinSesion from '../gestion/SinSesion'
import Cargar from '../gestion/Cargar'

import {Redirect} from "react-router-dom";
import { Formik, Field, Form, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';


class EntrenarRF extends Component{
    //Vista con un formulario para definir los parámetros de entrenamiento de
    //un Random Forest.

    constructor(props){
        super(props);
        this.state = {
            aEntrenamientos: false,
            aDatasetsEntrenamiento: false,
            id_dataset: null,
            mensaje_ayuda: <p>En esta ventana puedes definir las características del random forest que entrenarás.</p>

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




    iniciar_entrenamiento_rf(values){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }
        console.log("VALORES: ", values);

/*         response = requests.post("http://127.0.0.1:8000/api_tomo/entrenar_rf/", 
        {'dataset': id_dataset, 'n_estimadores' : n_estimadores, 'profundidad_max' : profundidad_max, 'min_samples_split' : min_samples_split,
        'min_samples_leaf' : min_samples_leaf, 'metricas' : metricas, 'comentarios' : comentarios, 'visibilidad' : visibilidad},
         headers={'Authorization': 'Token {}'.format(request.session["token"])}) */


  
        const par = {
            dataset: this.state.id_dataset,
            n_estimadores: values.n_estimadores,
            profundidad_max: values.profundidad_maxima,
            min_samples_split: values.min_split,
            min_samples_leaf: values.min_leaf,
            metricas: values.metricas,
            comentarios: values.comentarios,
            visibilidad: values.visibilidad,

        }



        console.log("PAR: ", par);


        axios.post(this.props.location.state.url_base + "api_tomo/entrenar_rf/", par, config)
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
            console.log("LLEGA HASTA AQUÍ PRINCIPAL");
            return <Redirect push to={{
                pathname: '/datasets_entrenamiento',
                state: { url_regreso: "/entrenar_rf",
                         token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        }

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
                                        <h5 className="card-title">Random forest</h5>
                                        
                                    <Formik
                                        initialValues={{n_estimadores : 10, profundidad_maxima : 100000, min_split: 0, min_leaf: 0,
                                                        metricas: ['mse', 'acierto'], visibilidad: 'True', comentarios: ''}}
                                        validationSchema={Yup.object({
        
                                        n_estimadores: Yup.number()
                                            .positive("Debe ser un número positivo.")
                                            .integer("Debe ser un número entero.")
                                            .min(1, 'El número de estimadores debe ser igual o superior a 1.')
                                            .max(1000, 'El número de estimadores debe ser igual o inferior a 1000.')
                                            .required('Campo requerido.'),
        
                                        profundidad_maxima: Yup.number()
                                            .positive("Debe ser un número positivo.")
                                            .integer("Debe ser un número entero.")
                                            .min(1, 'La profundidad máxima debe ser al menos 1.')
                                            .max(100000, 'La profundidad máxima no debe ser superior a 100000.')
                                            .required('Campo requerido.'),
        
                                        min_split: Yup.number()
                                            .positive("Debe ser un número positivo.")
                                            .integer("Debe ser un número entero.")
                                            .min(0, 'Selecciona un valor igual o superior a 0.')
                                            .max(1000, 'Selecciona un valor igual o inferior a 1000.')
                                            .required('Campo requerido.'),
                                        min_leaf: Yup.number()
                                            .positive("Debe ser un número positivo.")
                                            .integer("Debe ser un número entero.")
                                            .min(0, 'Selecciona un valor igual o superior a 0.')
                                            .max(1000, 'Selecciona un valor igual o inferior a 1000.')
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
                                            this.iniciar_entrenamiento_rf(values);
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
                                                    <label htmlFor="n_estimadores" className="col-sm-6 col-form-label"> Number of estimators: </label>
                                                    <div className="col-sm-6">
                                                        <Field type = "number" className="form-control" name="n_estimadores"/>
                                                        <span className = "error1"><ErrorMessage  name="n_estimadores" /> </span>
                                                    </div>
                                                </div>
        
                                                <div className="form-group row">
                                                    <label htmlFor="profundidad_maxima" className="col-sm-6 col-form-label"> Maximum depth: </label>
                                                    <div className="col-sm-6">
                                                        <Field type = "number" className="form-control" name="profundidad_maxima"/>
                                                        <span className = "error1"><ErrorMessage  name="profundidad_maxima" /> </span>
                                                    </div>
                                                </div>
        
                                                <div className="form-group row">
                                                    <label htmlFor="min_split" className="col-sm-6 col-form-label"> Minimum number of samples to split:  </label>
                                                    <div className="col-sm-6">
                                                        <Field type = "number" className="form-control" name="min_split"/>
                                                        <span className = "error1"><ErrorMessage  name="min_split" /> </span>
                                                    </div>
                                                </div>
        
                                                <div className="form-group row">
                                                    <label htmlFor="min_leaf" className="col-sm-6 col-form-label"> Minimum number of samples to be at a leaf node:  </label>
                                                    <div className="col-sm-6">
                                                        <Field type = "number" className="form-control" name="min_leaf"/>
                                                        <span className = "error1"><ErrorMessage  name="min_leaf" /> </span>
                                                    </div>
                                                </div>
        
                                            </div>
        
                                            
                                            {/*Columna derecha*/}
                                            <div className="col-md-6">
        
        
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

export default EntrenarRF;
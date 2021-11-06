import React, { Component } from 'react'
import Cabecera from '../gestion/Cabecera';
import BotonAtras from '../gestion/BotonAtras';
import SinSesion from '../gestion/SinSesion'
import axios from 'axios';
import {Redirect} from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';



class DatasetGenerar extends Component{
    //Vista con el formulario para generar un nuevo dataset.
    
    constructor(props){
        super(props);
        this.state = {
            //aImagenes: false,
            aTareas: false,
            mensaje_ayuda: <div>En esta ventana puedes definir las características del dataset que deseas generar, entre las que se encuentran el número de mallas
            con uno, dos y tres artefactos y el radio mínimo y máximo de los artefactos. La posición y la forma de los artefactos se define
            de forma pseudoaleatoria. El tamaño de los artefactos también se define de forma pseudoaleatoria, estableciendo para cada artefacto un
            tamaño de radio perteneciente al intervalo que indiques. Por ejemplo, si seleccionas 4 como radio mínimo y 10 como radio máximo, los
            artefactos contenidos en todas las mallas tendrán radios pertenecientes al intervalo [4,10].</div>
          }

    }



    generar_dataset(values){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }
        console.log("VALORES: ", values);
/*         var vis_aux = "False";
        if(this.state.visible === "true"){
            vis_aux = "True"
        } */
        const par = {
            n1: values.n_mallas_1,
            n2: values.n_mallas_2,
            n3: values.n_mallas_3,
            r_min: values.r_min,
            r_max: values.r_max,
            visible: values.visible,
            semilla: values.semilla,

        }


        axios.post(this.props.location.state.url_base + "api_tomo/generar_dataset/", par, config)
        .then(
            response => {
                console.log("Generar datasets.");
                this.setState({aTareas: true});
                console.log(response.data);
            })
        .catch(error => {
            //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
            console.error('Se ha producido un error.', error);
        }); 
    }

    render(){
        console.log("Se ejecuta dat generar");


        if (this.state.aTareas === true) {
            return <Redirect push to={{
                pathname: '/tareas_datasets',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
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
                                <div className="card-body" >
                                    <h5 className="card-title">Generate dataset</h5>
        
        
                                    <Formik
                                        initialValues={{ n_mallas_1: 50, n_mallas_2: 30, n_mallas_3: 20, r_min: 4, r_max: 10, visible : 'True', semilla: 12345678}}
                                        validationSchema={Yup.object({
                                        n_mallas_1: Yup.number()
                                            .positive("Debe ser un número positivo.")
                                            .integer("Debe ser un número entero.")
                                            .min(12, 'El mínimo número de mallas de un artefacto es 12.')
                                            .max(10000, 'No se pueden generar mas de 10000 mallas de un artefacto.')
                                            .required('Campo requerido.'),
                                        n_mallas_2: Yup.number()
                                            .positive("Debe ser un número positivo.")
                                            .integer("Debe ser un número entero.")
                                            .min(12, 'El mínimo número de mallas de dos artefactos es 12.')
                                            .max(10000, 'No se pueden generar mas de 10000 mallas de dos artefactos.')
                                            .required('Campo requerido.'),
                                        n_mallas_3: Yup.number()
                                            .positive("Debe ser un número positivo.")
                                            .integer("Debe ser un número entero.")
                                            .min(12, 'El mínimo número de mallas de tres artefactos es 12.')
                                            .max(10000, 'No se pueden generar mas de 10000 mallas de tres artefactos.')
                                            .required('Campo requerido.'),
                                        r_min: Yup.number()
                                            .positive("Debe ser un número positivo.")
                                            .integer("Debe ser un número entero.")
                                            .min(1, 'El radio mínimo debe pertenecer al intervalo [1,9].')
                                            .max(9, 'El radio mínimo debe pertenecer al intervalo [1,9].')
                                            .required('Campo requerido.'),
                                        r_max: Yup.number()
                                            .positive("Debe ser un número positivo.")
                                            .integer("Debe ser un número entero.")
                                            .min(2, 'El radio máximo debe pertenecer al intervalo [2,10].')
                                            .max(10, 'El radio máximo debe pertenecer al intervalo [2,10].')
                                            .required('Campo requerido.'),
                                        semilla: Yup.number()
                                            .positive("Debe ser un número positivo.")
                                            .integer("Debe ser un número entero.")
                                            .min(1, 'La semilla debe pertenecer al intervalo [1,99999999].')
                                            .max(99999999, 'La semilla debe pertenecer al intervalo [1,99999999].')
                                            .required('Campo requerido.')
                                        })}
                                        onSubmit={(values, { setSubmitting }) => {
                                        setTimeout(() => {
                                            console.log("HOLAAAAAAAAA");
                                            //alert(JSON.stringify(values, null, 2));
                                            //console.log("VALOR: ", values.usuario);
                                            this.generar_dataset(values);
                                            setSubmitting(false);
                                        });
                                        }}>
                                        <Form className = "row">
                                            <div className="col-md-12">
                                                <div className="form-group row">
                                                    <label htmlFor="n_mallas_1" className="col-sm-6 col-form-label"> Number of meshes with one artifact:</label>
                                                    <div className="col-sm-6">
                                                        <Field className="form-control width_10" name="n_mallas_1" type="number" />
                                                        <span className = "error1"><ErrorMessage  name="n_mallas_1" /> </span>
                                                    </div>
                                                </div>
                                                <hr/>
        
        
                                                <div className="form-group row">
                                                    <label htmlFor="n_mallas_2" className="col-sm-6 col-form-label"> Number of meshes with two artifacts:</label>
                                                    <div className="col-sm-6">
                                                        <Field className="form-control width_10" name="n_mallas_2" type="number" />
                                                        <span className = "error1"><ErrorMessage  name="n_mallas_2" /> </span>
                                                    </div>
                                                </div>
                                                <hr/>
        
        
                                                <div className="form-group row">
                                                    <label htmlFor="n_mallas_3" className="col-sm-6 col-form-label"> Number of meshes with three artifacts:</label>
                                                    <div className="col-sm-6">
                                                        <Field className="form-control width_10" name="n_mallas_3" type="number" />
                                                        <span className = "error1"><ErrorMessage  name="n_mallas_3" /> </span>
                                                    </div>
                                                </div>
                                                <hr/>
        
        
                                                <div className="form-group row">
                                                    <label htmlFor="r_min" className="col-sm-6 col-form-label"> Minimum radius:</label>
                                                    <div className="col-sm-6">
                                                        <Field className="form-control width_10" name="r_min" type="number" />
                                                        <span className = "error1"><ErrorMessage  name="r_min" /> </span>
                                                    </div>
                                                </div>
                                                <hr/>
        
        
                                                <div className="form-group row">
                                                    <label htmlFor="r_max" className="col-sm-6 col-form-label"> Maximum radius:</label>
                                                    <div className="col-sm-6">
                                                        <Field className="form-control width_10" name="r_max" type="number" />
                                                        <span className = "error1"><ErrorMessage  name="r_max" /> </span>
                                                    </div>
                                                </div>
                                                <hr/>
        
        
                                                <div className="form-group row">
                                                    <label htmlFor="visible" className="col-sm-6 col-form-label"> Visible:</label>
                                                    <div className="col-sm-6">
                                                        <Field className="form-control width_10" as = "select" name="visible">
                                                            <option value="True">Yes</option>
                                                            <option value="False">No</option>
                                                        </Field>
                                                        <span className = "error1"><ErrorMessage  name="visible" /> </span>
                                                    </div>
                                                </div>
                                                <hr/>
                                                
                                                <div className="form-group row">
                                                    <label htmlFor="semilla" className="col-sm-6 col-form-label"> Seed:</label>
                                                    <div className="col-sm-6">
                                                        <Field className="form-control width_10" name="semilla" type="number" />
                                                        <span className = "error1"><ErrorMessage  name="semilla" /> </span>
                                                    </div>
                                                </div>
                                                <hr/>
        
                                                <br/>
                                                <br/>
        
        
                                                <div className = "row">
                                                    <div className="col-md-12 text-center my-auto width_14" >
                                                        <button className="btn-lg btn-dark mb-2" type="submit"> Generate dataset</button>
                                                    </div>
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

export default DatasetGenerar;
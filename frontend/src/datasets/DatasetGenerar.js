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
            mensaje_ayuda: <div>In this window you can define the features of the dataset you want to generate, 
                among which are the number of meshes with one, two and three artifacts and the minimum 
                and maximum radius of the artifacts.   The position and shape of the artifacts are defined pseudo-randomly. 
                The size of the artifacts is also defined pseudo-randomly, by setting for each artifact a radius size that 
                belongs to the interval you specify. For example, if you select 4 as the minimum radius and 10 as the maximum radius, 
                the artifacts contained in all meshes will have radii belonging to the interval [4,10].

            </div>
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
                                    <h5 className="card-title"><b>Generate dataset</b></h5>
        
        
                                    <Formik
                                        initialValues={{ n_mallas_1: 50, n_mallas_2: 30, n_mallas_3: 20, r_min: 4, r_max: 10, visible : 'True', semilla: 12345678}}
                                        validationSchema={Yup.object({
                                        n_mallas_1: Yup.number()
                                            .positive("It must be a positive number.")
                                            .integer("It must be an integer.")
                                            .min(12, 'The minimum number of meshes with an artifact is 12.')
                                            .max(10000, 'No more than 10000 meshes with one artifact can be generated.')
                                            .required('Required field.'),
                                        n_mallas_2: Yup.number()
                                            .positive("It must be a positive number.")
                                            .integer("It must be an integer.")
                                            .min(12, 'The minimum number of meshes with two artifacts is 12.')
                                            .max(10000, 'No more than 10000 meshes with two artifacts can be generated.')
                                            .required('Required field.'),
                                        n_mallas_3: Yup.number()
                                            .positive("It must be a positive number.")
                                            .integer("It must be an integer.")
                                            .min(12, 'The minimum number of meshes with three artifacts is 12.')
                                            .max(10000, 'No more than 10000 meshes with three artifacts can be generated.')
                                            .required('Required field.'),
                                        r_min: Yup.number()
                                            .positive("It must be a positive number.")
                                            .integer("It must be an integer.")
                                            .min(1, 'The minimum radius must belong to the interval [1,9].')
                                            .max(9, 'The minimum radius must belong to the interval [1,9].')
                                            .required('Required field.'),
                                        r_max: Yup.number()
                                            .positive("It must be a positive number.")
                                            .integer("It must be an integer.")
                                            .min(2, 'The maximus radius must belong to the interval [2,10].')
                                            .max(10, 'The maximus radius must belong to the interval [2,10].')
                                            .required('Required field.'),
                                        semilla: Yup.number()
                                            .positive("It must be a positive number.")
                                            .integer("It must be an integer.")
                                            .min(1, 'The seed must belong to the interval [1,99999999].')
                                            .max(99999999, 'The seed must belong to the interval [1,99999999].')
                                            .required('Required field.')
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
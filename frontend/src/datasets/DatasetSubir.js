import React, { Component } from 'react'
import Cabecera from '../gestion/Cabecera';
import BotonAtras from '../gestion/BotonAtras';
import Cargar from '../gestion/Cargar'
import axios from 'axios';
import SinSesion from '../gestion/SinSesion'
import {Redirect} from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';



class DatasetSubir extends Component{
    //Vista con el formulario para subir un dataset al sistema a través de un fichero.
    
    constructor(props){
        super(props);
        this.state = {
            //aImagenes: false,
            aTareas: false,
            fichero: null,
            error_estructura: false,
            error_seleccion: false,
            carga: false,
            mensaje_ayuda: <p>En esta ventana puedes subir y añadir al sistema un dataset. El dataset que subas debe encontrarse en formato CSV, de forma que
            cada línea contenga, separados por punto y coma, los valores de voltaje, los valores de impedancia y el número de artefactos de cada
            malla. En caso de que el fichero que selecciones no se encuentre en formato CSV o tenga una estructura incorrecta,
            se mostrará un error.</p>,
            
        }

        this.handleChangeFichero = this.handleChangeFichero.bind(this);

    }


    handleChangeFichero(e){
        console.log("Handle fichero");
        this.setState({fichero: e.target.files[0]});
    }



    subir_dataset(values){
        this.setState({error_seleccion: false, cargar: true});

        if(this.state.fichero === null){
            this.setState({error_seleccion: true, cargar: false});
        }else{
            console.log("probando");
            const config = {
                headers: {
                  'Authorization': 'Token ' + this.props.location.state.token
                  //'Content-Disposition': this.state.fichero.filename,
                }
            }
    
            const formData = new FormData(); 
         
            // Update the formData object 
            formData.append("file", this.state.fichero);
            formData.append("r_min", values.r_min);
            formData.append("r_max", values.r_max);
            formData.append("visible", values.visible);
            formData.append("semilla", values.semilla);
    
    
            axios.post(this.props.location.state.url_base + "api_tomo/subir_dataset/", formData,config)
            .then(
                response => {
                    console.log("Subir datasets.");
                    this.setState({aTareas: true});
                    console.log(response.data);
                })
            .catch(error => {
                //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
                console.error('Se ha producido un error.', error);
                this.setState({error_estructura:true, cargar: false});
            }); 
        }

    }





    render(){
        console.log("Se ejecuta dat subir");


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
        
                        {this.state.carga === true ? (
                            <Cargar
                                completo = {false} 
                            />
                        ):(
                            <div className="container">
                                <div className="card caja">
                                    <div className="card-body" >
                                        <h5 className="card-title">Upload dataset</h5>
        
        
                                        <Formik
                                            initialValues={{ r_min: 4, r_max: 10, visible : 'True', semilla: 12345678}}
                                            validationSchema={Yup.object({
            
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
                                                console.log("FORMULARIO SUBMIT");
                                                //alert(JSON.stringify(values, null, 2));
                                                //console.log("VALOR: ", values.usuario);
                                                this.subir_dataset(values);
                                                setSubmitting(false);
                                            });
                                            }}>
                                            <Form className = "row">
                                                <div className="col-md-12">
        
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
        
                                                    <div className="form-group row">
        
                                                        <label className="col-sm-6 col-form-label"> Select the dataset you want to upload: </label>
        
                                                        <div className="col-sm-3">
                                                        <input type="file" className="form-control-file seleccionado" onChange={this.handleChangeFichero}/> 
                                                        </div>
                                          
        
                                                    </div>
                                                    
                                                    {this.state.error_estructura === true &&
                                                        <div className="alert alert-danger" role="alert" id = "estructura_incorrecta">
                                                            El formato o la estructura del fichero seleccionado es incorrecta.
                                                        </div>
                                                    }
        
        
                                                    {this.state.error_seleccion === true &&
                                                        <div className="alert alert-danger row" role="alert" id = "mensaje_informativo" >
                                                            No has seleccionado ningún fichero.
                                                        </div>
                                                    }
        
                                                    <br/>
                                                    <br/>
        
        
                                                    <div className = "row">
                                                        <div className="col-md-12 text-center my-auto width_14" >
                                                            <button className="btn-lg btn-dark mb-2" type="submit"> Upload dataset</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Form>
                                        </Formik>
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

export default DatasetSubir;
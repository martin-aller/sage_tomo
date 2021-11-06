import React, { Component } from 'react'
import Cabecera from './Cabecera';
import BotonAtras from './BotonAtras';
import axios from 'axios';
import {Redirect} from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

class Registro extends Component{
    //Vista con el formulario para que un usuario se registre.
    
    constructor(props){
        super(props);
        this.state = {
            nickname_email_usado: false,
            exito_registro: false,
            mensaje_ayuda: <p>Cubre todos los campos para crearte una cuenta en TomoSage. Podrás editar todos los campos en el futuro,
                           con excepción del nombre de usuario.</p>

          }
    

    }




    registrar(values){
        console.log("Registrar.");

        this.setState({ contrasenhas_diferentes: false});
        this.setState({ nickname_email_usado: false});

        const par = {
            username: values.nombre_usuario, 
            first_name: values.nombre, 
            last_name : values.apellidos,
            password1: values.contrasenha1,
            password2: values.contrasenha2,
            email: values.correo_electronico,

        }

        console.log('Token ' + sessionStorage.token);
        axios.post(this.props.location.state.url_base + "api_tomo/dj-rest-auth/registration/", par)
            .then(
                response => {
                    console.log("Registro ÉXITO: ", values.nombre_usuario);
                    this.setState({ exito_registro: true});
                    sessionStorage.token = response.data.key;
                    sessionStorage.usuario  = values.nombre_usuario;
                })
            .catch(error => {
                this.setState({ nickname_email_usado: true});
                console.error('Se ha producido un error.', error);
            });

        
    }

    render(){
        console.log("Se ejecuta REGISTRO");

        if (this.state.exito_registro === true) {
            return <Redirect push to={{
                pathname: '/exito_registro',
                state: { token: sessionStorage.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        return(
            <div>
                <Cabecera con_cuenta = {false} mensaje_ayuda = {this.state.mensaje_ayuda} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                <BotonAtras/>
                
                <div className="card caja mx-auto mb-3 max_width_50">
                <div className="card-header"> Sign up </div>
                <div className="card-body">
                    <h5 className="card-title">Register form</h5>


                    <Formik
                        initialValues={{ nombre_usuario: '', nombre: '', apellidos: '', correo_electronico: '', contrasenha1: '', contrasenha2: ''}}
                        validationSchema={Yup.object({
                        nombre_usuario: Yup.string()
                            .max(20, 'El nombre de usuario no puede tener más de 20 caracteres.')
                            .required('Campo requerido.'),
                        nombre: Yup.string()
                            .max(100, 'El nombre no puede tener más de 100 caracteres.')
                            .required('Campo requerido.'),
                        apellidos: Yup.string()
                            .max(100, 'El apellido no puede tener más de 100 caracteres.')
                            .required('Campo requerido.'),
                        correo_electronico: Yup.string()
                            .email('Introduce un correo electrónico válido.')
                            .required('Campo requerido.'),
                        contrasenha1: Yup.string()
                            .max(20, 'La contraseña no puede tener más de 20 caracteres.')
                            .required('Campo requerido.'),
                        contrasenha2: Yup.string()
                            .max(20, 'La contraseña no puede tener más de 20 caracteres.')
                            .required('Campo requerido.')
                            .oneOf([Yup.ref('contrasenha1'), null], 'Las contraseñas no coinciden'),
                        })}
                        onSubmit={(values, { setSubmitting }) => {
                        setTimeout(() => {
                            console.log("HOLAAAAAAAAA");
                            //alert(JSON.stringify(values, null, 2));
                            //console.log("VALOR: ", values.usuario);
                            this.registrar(values);
                            setSubmitting(false);
                        });
                        }}>
                        <Form>
                            <div className="form-group row">
                                <label htmlFor="nombre_usuario" className="col-sm-4 col-form-label"> Username:</label>
                                <div className="col-sm-8">
                                <Field className="form-control" name="nombre_usuario" type="text" />
                                <span className = "error1"><ErrorMessage  name="nombre_usuario" /> </span>
                                </div>
                            </div>



                            <div className="form-group row">
                                <label htmlFor="nombre" className="col-sm-4 col-form-label"> First name:</label>
                                <div className="col-sm-8">
                                <Field className="form-control" name="nombre" type="text" />
                                <span className = "error1"><ErrorMessage  name="nombre" /> </span>
                                </div>
                            </div>



                            <div className="form-group row">
                                <label htmlFor="apellidos" className="col-sm-4 col-form-label"> Last name:</label>
                                <div className="col-sm-8">
                                <Field className="form-control" name="apellidos" type="text" />
                                <span className = "error1"><ErrorMessage  name="apellidos" /> </span>
                                </div>
                            </div>



                            <div className="form-group row">
                                <label htmlFor="correo_electronico" className="col-sm-4 col-form-label"> Email:</label>
                                <div className="col-sm-8">
                                <Field className="form-control" name="correo_electronico" type="email" />
                                <span className = "error1"><ErrorMessage  name="correo_electronico" /> </span>
                                </div>
                            </div>



                            <div className="form-group row">
                                <label htmlFor="contrasenha1" className="col-sm-4 col-form-label"> Password:</label>
                                <div className="col-sm-8">
                                <Field className="form-control" name="contrasenha1" type="password" />
                                <span className = "error1"><ErrorMessage  name="contrasenha1" /> </span>
                                </div>
                            </div>



                            <div className="form-group row">
                                <label htmlFor="contrasenha2" className="col-sm-4 col-form-label"> Confirm the password:</label>
                                <div className="col-sm-8">
                                <Field className="form-control" name="contrasenha2" type="password" />
                                <span className = "error1"><ErrorMessage  name="contrasenha2" /> </span>
                                </div>
                            </div>

                            {this.state.nickname_email_usado === true &&
                                    <div className="alert alert-danger">
                                            El nombre de usuario o el correo electrónico ya se encuentran en uso.
                                    </div>
                            }
                            <button className="btn btn-dark mb-2 float-right" type="submit">Sign up</button>
                        </Form>
                    </Formik>
                </div>
                </div>

            </div>
        );
    }
}

export default Registro;
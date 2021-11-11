import React, { Component } from 'react'
import Header from './Header';
import {Redirect} from "react-router-dom";
import axios from 'axios';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';


class LogIn extends Component{
    //Initial view of the system, before logging in or signing up.

    constructor(props){
        super(props);
        this.state = {
            toSignUp: false,
            toHome: false,
            error_message: null,
            url_base : "http://127.0.0.1:8000/", //Todas las peticiones al backend tendrán una URL que comience con esta raíz
            token: "",
            help_message: <p>In order to use the SageTomo system, you need to have an account. Click on Register if you want 
                              to create a new account. </p>            

          }    
    }


    initiate_session(values){
        const par = {
            username: values.usuario, 
            email: 'aa@gmail.com', 
            password : values.contrasenha
        }
        axios.post(this.state.url_base + "api_tomo/dj-rest-auth/login/", par)
            .then(
                response => {
                    
                    sessionStorage.usuario  = values.usuario;
                    this.setState({ toHome: true, token: response.data.key});
                    
                })
            .catch(error => {
                this.setState({error_message: "Username or password are incorrect."});
                console.error('There was an error!', error);
            });
        
    }


    registro_true(){
        this.setState({ toSignUp: true});
    }



    render(){

        if (this.state.toSignUp === true) {
            return <Redirect push to={{
                pathname: '/registro',
                state: { url_base: this.state.url_base}
            }}/>        
        }


        if (this.state.toHome === true) {
            return <Redirect push to={{
                pathname: '/principal',
                state: { token: this.state.token, url_base: this.state.url_base}
            }}/>        
        }



        return(
            <div>
                <Header con_cuenta = {false} help_message = {this.state.help_message} url_base = {this.state.url_base}/>
                <div className="container margin_bottom_1">
                    <div className = "row text-center">
                        <div className="col-md-4"></div>
                        <div className="col-md-4" >
                            <img src={process.env.PUBLIC_URL + '/images/logo.png'} className="img-fluid logo_inicio" alt = "logo inicio"/>
                        </div>
                        <div className="col-md-4"></div>
                    </div>
                </div>
                <div className="container" >
                    <div className="d-flex justify-content-center h-100" >
                        <div className="card caja">
                            <div className="card-header">
                                <h3>Log in</h3>
                            </div>
                            <div className="card-body">


                                <Formik
                                    initialValues={{ usuario: '', contrasenha: ''}}
                                    validationSchema={Yup.object({

                                    usuario: Yup.string()
                                        .max(20, 'Username cannot be longer than 20 characters.')
                                        .required('Required field.'),

                                        contrasenha: Yup.string()
                                        .max(20, 'Password cannot be longer than 20 characters.')
                                        .required('Required field.'),

                                    })}

                                    onSubmit={(values, { setSubmitting }) => {
                                    setTimeout(() => {
                                        this.initiate_session(values);
                                        setSubmitting(false);
                                    });
                                    }}>

                                    <Form>
                                        <div className="input-group form-group">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text"><i className="fas fa-user"></i></span>
                                            </div>
                                            <Field className="form-control" name="usuario" type="text" placeholder = "Usuario" />

                                        </div>
                                        <div className = "error1">
                                                <ErrorMessage  name="usuario" /> 
                                        </div>

                                        <div className="input-group form-group">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text"></span>
                                            </div>
                                            <Field className="form-control" name="contrasenha" type="password" placeholder = "Contraseña"/>
                                        </div>

                                        <div className = "error1">
                                                <ErrorMessage  name="contrasenha" /> 
                                        </div>

                                        <button className="btn float-right login_btn btn-dark" type="submit">Access</button>

                                    </Form>

                                </Formik>
                            </div>
                            <div className="card-footer">
                                {this.state.error_message !== null &&
                                    <div className="alert alert-danger">
                                        <p>{this.state.error_message}</p>
                                    </div>
                                }
                                <div className="d-flex justify-content-center links">
                                    Don't have an account? <p  className = "btn-link cursor_puntero margin_left_05" onClick = {() => this.registro_true()}> Sign up. </p>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>    
            </div>
        );
    }

}

export default LogIn;
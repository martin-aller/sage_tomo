import React, { Component } from 'react'
import Header from './Header';
import GoBackButton from './GoBackButton';
import axios from 'axios';
import {Redirect} from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

class SignUp extends Component{
    //View with the form to sign up.
    
    constructor(props){
        super(props);
        this.state = {
            nickname_email_used: false,
            success_signup: false,
            help_message: <p>You must fill all the fields from the form to create a SageTomo account. You will be able to edit 
                all fields in the future, except the username.</p>
          }
    }




    registrar(values){
        
        this.setState({ contrasenhas_diferentes: false});
        this.setState({ nickname_email_used: false});

        const par = {
            username: values.username, 
            first_name: values.nombre, 
            last_name : values.apellidos,
            password1: values.contrasenha1,
            password2: values.contrasenha2,
            email: values.email_electronico,

        }

        axios.post(this.props.location.state.url_base + "api_tomo/dj-rest-auth/registration/", par)
            .then(
                response => {
                    
                    this.setState({ success_signup: true});
                    sessionStorage.token = response.data.key;
                    sessionStorage.usuario  = values.username;
                })
            .catch(error => {
                this.setState({ nickname_email_used: true});
                console.error('An error has occurred', error);
            });

        
    }

    render(){
        

        if (this.state.success_signup === true) {
            return <Redirect push to={{
                pathname: '/success_signup',
                state: { token: sessionStorage.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        return(
            <div>
                <Header con_cuenta = {false} help_message = {this.state.help_message} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                <GoBackButton/>
                
                <div className="card caja mx-auto mb-3 max_width_50">
                <div className="card-header"> Sign up </div>
                <div className="card-body">
                    <h5 className="card-title">Register form</h5>


                    <Formik
                        initialValues={{ username: '', nombre: '', apellidos: '', email_electronico: '', contrasenha1: '', contrasenha2: ''}}
                        validationSchema={Yup.object({
                        username: Yup.string()
                            .max(20, 'Username cannot be longer than 20 characters.')
                            .required('Required field.'),
                        nombre: Yup.string()
                            .max(100, 'First name cannot be longer than 100 characters.')
                            .required('Required field.'),
                        apellidos: Yup.string()
                            .max(100, 'Last name cannot be longer than 100 characters.')
                            .required('Required field.'),
                        email_electronico: Yup.string()
                            .email('Enter a valid email adress.')
                            .required('Required field.'),
                        contrasenha1: Yup.string()
                            .max(20, 'Password cannot be longer than 20 characters.')
                            .required('Required field.'),
                        contrasenha2: Yup.string()
                            .max(20, 'Password cannot be longer than 20 characters.')
                            .required('Required field.')
                            .oneOf([Yup.ref('contrasenha1'), null], 'Las contraseñas no coinciden'),
                        })}
                        onSubmit={(values, { setSubmitting }) => {
                        setTimeout(() => {
                            
                            this.registrar(values);
                            setSubmitting(false);
                        });
                        }}>
                        <Form>
                            <div className="form-group row">
                                <label htmlFor="username" className="col-sm-4 col-form-label"> Username:</label>
                                <div className="col-sm-8">
                                <Field className="form-control" name="username" type="text" />
                                <span className = "error1"><ErrorMessage  name="username" /> </span>
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
                                <label htmlFor="email_electronico" className="col-sm-4 col-form-label"> Email:</label>
                                <div className="col-sm-8">
                                <Field className="form-control" name="email_electronico" type="email" />
                                <span className = "error1"><ErrorMessage  name="email_electronico" /> </span>
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

                            {this.state.nickname_email_used === true &&
                                    <div className="alert alert-danger">
                                            The username or e-mail address is already in use.
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

export default SignUp;
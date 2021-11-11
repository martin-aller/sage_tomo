import React, { Component } from 'react'
import Header from './Header';
import GoBackButton from './GoBackButton';
import NoSession from './NoSession'
import axios from 'axios';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';


class  Account extends Component{
    //View with the user's account information.
    
    constructor(props){
        super(props);
        this.state = {
            saved_message: false,
            help_message: <p> In this window you can edit personal information about your account.</p>
          }

    }

    
    save_changes(values){
        this.setState({ saved_message: false});

        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }
        const par = {
            username: sessionStorage.usuario, 
            first_name: values.nombre, 
            last_name : values.apellidos,
            email : values.email,
        }


        axios.patch(this.props.location.state.url_base + "api_tomo/dj-rest-auth/user/", par, config)
            .then(
                response => {
                    
                    
                    
                    setTimeout(() => {
                        this.setState({ saved_message: true});
                    }, 100);
                    

                })
            .catch(error => {
                console.error('There was an error!', error);
            });
    }


    componentDidMount(){
        this.setState({
            nombre: this.props.location.state.nombre,
            apellidos: this.props.location.state.apellidos,
            email: this.props.location.state.email,
         });
    }

    
    render(){

        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Header con_cuenta = {true} help_message = {this.state.help_message} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <GoBackButton/>
                        <div className ="card caja mx-auto mb-3 max_width_50" >
                            <div className ="card-header"><b>Edit information</b></div>
                            <div className ="card-body">
                                <h5 className ="card-title">Your account: {sessionStorage.usuario}</h5>
                                <Formik
                                    initialValues={{nombre: this.props.location.state.nombre, 
                                                    apellidos: this.props.location.state.apellidos, 
                                                    email_electronico: this.props.location.state.email}}
                                    validationSchema={Yup.object({

                                    nombre: Yup.string()
                                        .max(100, 'The first name cannot be longer than 100 characters..')
                                        .required('Required field.'),
                                    apellidos: Yup.string()
                                        .max(100, 'The last name cannot be longer than 100 characters..')
                                        .required('Required field.'),
                                    email_electronico: Yup.string()
                                        .email('Enter a valid email address.')
                                        .required('Required field.'),

                                    })}
                                    onSubmit={(values, { setSubmitting }) => {
                                    setTimeout(() => {
                                        
                                        this.save_changes(values);
                                        setSubmitting(false);
                                    });
                                    }}>
                                    <Form>

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


                                        <button className="btn btn-dark mb-2 float-right" type="submit"> Save changes</button>
                                    </Form>
                                </Formik>
                            </div>
                        </div>
                        {this.state.saved_message === true &&
                            <div className = "container max_width_50">
                                <div className="alert alert-primary alert-dismissible">
                                    <span  className="close" data-dismiss="alert" aria-label="close">&times;</span>
                                    Changes saved successfully.
                                </div>
                            </div>
                        }
                    </div>
                ):(
                    <NoSession/>
                )}




            </div>
        );
    }
}

export default Account;
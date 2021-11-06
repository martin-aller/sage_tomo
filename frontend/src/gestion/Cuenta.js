import React, { Component } from 'react'
import Cabecera from './Cabecera';
import SinSesion from './SinSesion'
import axios from 'axios';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';


class  Cuenta extends Component{
    //Vista con la información de la cuenta de un usuario.
    
    constructor(props){
        super(props);
        this.state = {
            mensaje_guardado: false,
            mensaje_ayuda: <p> En esta ventana puedes editar la información personal sobre tu cuenta.</p>
          }

    }

    

    guardar_cambios(values){
        this.setState({ mensaje_guardado: false});

        console.log("Token guardar: ", sessionStorage.token)


        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }
        const par = {
            username: sessionStorage.usuario, 
            first_name: values.nombre, 
            last_name : values.apellidos,
            email : values.correo,

        }


        axios.patch(this.props.location.state.url_base + "api_tomo/dj-rest-auth/user/", par, config)
            .then(
                response => {
                    console.log("API REST");
                    console.log(response.data);
                    
                    setTimeout(() => {
                        this.setState({ mensaje_guardado: true});
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
            correo: this.props.location.state.correo,
         });
    }
    render(){

        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Cabecera con_cuenta = {true} mensaje_ayuda = {this.state.mensaje_ayuda} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <div className ="card caja mx-auto mb-3 max_width_50" >
                            <div className ="card-header">Edit information</div>
                            <div className ="card-body">
                                <h5 className ="card-title">Your account: {sessionStorage.usuario}</h5>
                                <Formik
                                    initialValues={{nombre: this.props.location.state.nombre, 
                                                    apellidos: this.props.location.state.apellidos, 
                                                    correo_electronico: this.props.location.state.correo}}
                                    validationSchema={Yup.object({

                                    nombre: Yup.string()
                                        .max(100, 'El nombre no puede tener más de 100 caracteres.')
                                        .required('Campo requerido.'),
                                    apellidos: Yup.string()
                                        .max(100, 'El apellido no puede tener más de 100 caracteres.')
                                        .required('Campo requerido.'),
                                    correo_electronico: Yup.string()
                                        .email('Introduce un correo electrónico válido.')
                                        .required('Campo requerido.'),

                                    })}
                                    onSubmit={(values, { setSubmitting }) => {
                                    setTimeout(() => {
                                        console.log("HOLAAAAAAAAA");
                                        this.guardar_cambios(values);
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
                                            <label htmlFor="correo_electronico" className="col-sm-4 col-form-label"> Email:</label>
                                            <div className="col-sm-8">
                                            <Field className="form-control" name="correo_electronico" type="email" />
                                            <span className = "error1"><ErrorMessage  name="correo_electronico" /> </span>
                                            </div>
                                        </div>




                                        <button className="btn btn-dark mb-2 float-right" type="submit"> Save changes</button>
                                    </Form>
                                </Formik>
                            </div>
                        </div>
                        {this.state.mensaje_guardado === true &&
                            <div className = "container max_width_50">
                                <div className="alert alert-primary alert-dismissible">
                                    <span  className="close" data-dismiss="alert" aria-label="close">&times;</span>
                                    Changes saved successfully.
                                </div>
                            </div>
                        }
                    </div>
                ):(
                    <SinSesion/>
                )}




            </div>
        );
    }
}

export default Cuenta;
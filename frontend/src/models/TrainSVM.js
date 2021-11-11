import React, { Component } from 'react'
import Header from '../management/Header';
import GoBackButton from '../management/GoBackButton';
import NoSession from '../management/NoSession'
import Loading from '../management/Loading'
import {Redirect} from "react-router-dom";
import { Formik, Field, Form, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import axios from 'axios';


class TrainSVM extends Component{
    //View with a form to define the training parameters for a support vector machine.
    
    constructor(props){
        super(props);
        this.state = {
            toTrainings: false,
            toTrainingDatasets: false,
            id_dataset: null,
            help_message: <p>In this window you can define the features for the support vector machine that you will train.</p>,

          }
    }

    componentDidMount(){
        if(this.props.location.state !== undefined && "id_dataset" in  this.props.location.state){
            this.setState({id_dataset: this.props.location.state.id_dataset});
        }else{
            this.get_datasets_menor();
        }
    }

    abre_metrics(){
        document.getElementById("dropdown-menu-metrics").classList.toggle("show");
    }

    access_datasets_train(){
        this.setState({toTrainingDatasets:true});
    }




    initiate_training_svm(values){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }
  
        const par = {
            dataset: this.state.id_dataset,
            kernel: values.kernel,
            degree: values.degree,
            gamma: values.gamma,
            coef0: values.coef0,
            tol: values.tol,
            c: values.c,
            epsilon: values.epsilon,
            metrics: values.metrics,
            comentarios: values.comentarios,
            visibilidad: values.visibilidad,

        }

        axios.post(this.props.location.state.url_base + "api_tomo/train_svm/", par, config)
        .then(
            response => {
                
                this.setState({toTrainings: true});
                
            })
        .catch(error => {
            
            console.error('An error has occurred', error);
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
            console.error('An error has occurred', error);
        });
    }



    render(){
        
        if (this.state.toTrainings === true) {
            return <Redirect push to={{
                pathname: '/tasks_models',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        if (this.state.toTrainingDatasets === true) {
            return <Redirect push to={{
                pathname: '/datasets_training',
                state: { url_regreso: "/train_svm",
                         token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>
        }

        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Header con_cuenta = {true} help_message = {this.state.help_message} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <GoBackButton/>

                        <div className="container">
                            <div className="card caja">
                                    <div className="card-header"> Train model </div>
                                    <div className="card-body" >
                                        <h5 className="card-title"><b>Support Vector Machine</b></h5>
                                        
                                    <Formik
                                        initialValues={{kernel : "rbf", degree : 3, gamma : "auto", coef0: 100, tol: 7, c : 1200000,
                                                        epsilon: 0.1, metrics: ['mse', 'acierto'], visibilidad: 'True', comentarios: ''}}
                                        validationSchema={Yup.object({

                                        degree: Yup.number()
                                            .positive("Enter a positive number.")
                                            .integer("It must be an integer.")
                                            .min(1, 'The degree must be at least 1.')
                                            .max(1000, 'The degree cannot be higher than 1000.')
                                            .required('Required field.'),

                                        coef0: Yup.number()
                                            .positive("Enter a positive number.")
                                            .min(0, 'It must be equal or higher than 0.')
                                            .max(1000, 'It must be equal or lower than 1000.')
                                            .required('Required field.'),
                                        tol: Yup.number()
                                            .positive("Enter a positive number.")
                                            .min(0, 'It must be equal or higher than 0.')
                                            .max(100, 'It must be equal or lower than 100.')
                                            .required('Required field.'),
                                        c: Yup.number()
                                            .positive("Enter a positive number.")
                                            .min(0, 'It must be equal or higher than 0.')
                                            .max(10000000, 'It must be equal or lower than 10000000.')
                                            .required('Required field.'),

                                        epsilon: Yup.number()
                                            .positive("Enter a positive number.")
                                            .min(0, 'It must be equal or higher than 0.')
                                            .max(100, 'It must be equal or lower than 100.')
                                            .required('Required field.'),

                                        visibilidad: Yup.string()
                                            .required('Required field.'),
                                        comentarios: Yup.string()
                                            .max(100, 'The comment cannot be longer than 100 characters.')
                                        
                                        })}
                                        onSubmit={(values, { setSubmitting }) => {
                                        setTimeout(() => {
                                            this.initiate_training_svm(values);
                                            setSubmitting(false);
                                        });
                                        }}>
                                        <Form className = "row">
                                            {/*Left column*/}
                                            <div className="col-md-6 columna_izquierda_train">
                                                {this.state.id_dataset === null ? (
                                                    <Loading completo = {false}/>
                                                ):(
                                                    <div>
                                                        <div className="form-group row">
                                                            <label htmlFor="dataset" className="col-sm-6 col-form-label"> Select dataset: </label>
                                                            <div className="col-sm-6 top_0_3">
                                                                <input type="button" className="btn-sm btn-dark  mb-2"
                                                                id = "btn_train width_15" value = "Select dataset" onClick = {() => this.access_datasets_train()}/> 
                                                            </div>
                                                        </div>
                
                                                        
                                                        <div className="form-group row">
                                                            <label htmlFor="dataset_selected" className="col-sm-6 col-form-label"> Selected dataset (ID): </label>
                                                            <div className="col-sm-6 top_0_4" >
                                                
                                                                    <b className = " borde_visible">{this.state.id_dataset}</b>                                                     
                                                            </div>
                                                        </div>
                                                    </div>

                                                )}
                                            

                                                <div className="form-group row">
                                                    <label htmlFor="kernel" className="col-sm-6 col-form-label"> Kernel: </label>
                                                    <div className="col-sm-6">
                                                        <Field className="form-control"  name="kernel" as = "select" >
                                                            <option value = "rbf"> Radial Basis Function (RBF) </option>
                                                            <option value = "linear"> Linear </option>
                                                            <option value = "sigmoid"> Sigmoid </option>
                                                            <option value = "poly"> Polynomial </option>
                                                        </Field>
                                                        <span className = "error1"><ErrorMessage  name="kernel" /> </span>

                                                    </div>
                                                </div>



                                                <div className="form-group row">
                                                    <label htmlFor="degree" className="col-sm-6 col-form-label"> Degree: </label>
                                                    <div className="col-sm-6">
                                                        <Field type = "number" className="form-control" name="degree"/>
                                                        <span className = "error1"><ErrorMessage  name="degree" /> </span>
                                                    </div>
                                                </div>

                                                <div className="form-group row">
                                                    <label htmlFor="gamma" className="col-sm-6 col-form-label"> Gamma: </label>
                                                    <div className="col-sm-6">
                                                        <Field className="form-control"  name="gamma" as = "select" >
                                                            <option value = "auto"> Auto </option>
                                                            <option value = "scale"> Scale </option>
                                                            <option value = "float"> Float </option>
                                                        </Field>
                                                        <span className = "error1"><ErrorMessage  name="gamma" /> </span>

                                                    </div>
                                                </div>

                                                <div className="form-group row">
                                                    <label htmlFor="coef0" className="col-sm-6 col-form-label"> Coefficient 0: </label>
                                                    <div className="col-sm-6">
                                                        <Field type = "number" className="form-control" name="coef0" step="0.01"/>
                                                        <span className = "error1"><ErrorMessage  name="coef0" /> </span>
                                                    </div>
                                                </div>

                                                <div className="form-group row">
                                                    <label htmlFor="tol" className="col-sm-6 col-form-label"> Tolerance:  </label>
                                                    <div className="col-sm-6">
                                                        <Field type = "number" className="form-control" name="tol" step="0.001"/>
                                                        <span className = "error1"><ErrorMessage  name="tol" /> </span>
                                                    </div>
                                                </div>

                                                <div className="form-group row">
                                                    <label htmlFor="c" className="col-sm-6 col-form-label"> C:  </label>
                                                    <div className="col-sm-6">
                                                        <Field type = "number" className="form-control" name="c" step="0.01"/>
                                                        <span className = "error1"><ErrorMessage  name="c" /> </span>
                                                    </div>
                                                </div>

                                                <div className="form-group row">
                                                    <label htmlFor="epsilon" className="col-sm-6 col-form-label"> Epsilon:  </label>
                                                    <div className="col-sm-6">
                                                        <Field type = "number" className="form-control" name="epsilon" step = "0.01"/>
                                                        <span className = "error1"><ErrorMessage  name="epsilon" /> </span>
                                                    </div>
                                                </div>

                                            </div>

                                            
                                            {/*Right column*/}
                                            <div className="col-md-6">


                                                <div className="form-group row">
                                                    <label htmlFor="dropdown_metrics" className="col-sm-6 col-form-label"> Metric selection: </label>
                                                    <div className="col-sm-6">
                                                        <div className="dropdown" id = "dropdown_metrics" name = "dropdown_metrics" >
                                                            <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu2" 
                                                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" onClick = {() => this.abre_metrics()}>
                                                                Choose one or more
                                                            </button>
                                                            <div className="dropdown-menu" id = "dropdown-menu-metrics" aria-labelledby="dropdownMenu2">
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <Field type="checkbox" name = "metrics" value = "mse" checked onclick="return false;"/> Mean Squared Error (required)
                                                                    </label>
                                                                </div>
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <Field type="checkbox" name = "metrics" value = "acierto" checked onclick="return false;"/> Accuracy (required)
                                                                    </label>
                                                                </div>
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <Field type="checkbox" name = "metrics" value = "mean_absolute_error"/> Mean Absolute Error
                                                                    </label>
                                                                </div>
        
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <Field type="checkbox" name = "metrics" value = "mean_squared_logarithmic_error"/> Mean Squared Logarithmic Error
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
                                                        <Field component = "textask" className="form-control" name = "comentarios" />
                                                        <span className = "error1"><ErrorMessage  name="comentarios" /> </span>
                                                    </div>
                                                </div>
                                                <div className = "text-center margin_top_6">
                                                    <button type="submit" className="btn-lg btn-dark  mb-2" id = "btn_train" > Start training </button>
                                                </div>
                                            </div>

                                        </Form>
                                    </Formik>
                                    </div>
                            </div>
                        </div>

                    </div>
                ):(
                    <NoSession/>
                )}

            </div>
        );
    }
}

export default TrainSVM;
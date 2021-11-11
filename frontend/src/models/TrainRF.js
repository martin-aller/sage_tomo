import React, { Component } from 'react'
import Header from '../management/Header';
import GoBackButton from '../management/GoBackButton';
import NoSession from '../management/NoSession'
import Loading from '../management/Loading'

import {Redirect} from "react-router-dom";
import { Formik, Field, Form, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import axios from 'axios';


class TrainRF extends Component{
    //View with a form to define the training parameters for a random forest.

    constructor(props){
        super(props);
        this.state = {
            toTrainings: false,
            toTrainingDatasets: false,
            id_dataset: null,
            help_message: <p>In this window you can define the features for the random forest that you will train.</p>

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




    initiate_training_rf(values){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }
        
  
        const par = {
            dataset: this.state.id_dataset,
            n_estimators: values.n_estimators,
            max_depth: values.max_depth,
            min_samples_split: values.min_split,
            min_samples_leaf: values.min_leaf,
            metrics: values.metrics,
            comentarios: values.comentarios,
            visibilidad: values.visibilidad,

        }


        axios.post(this.props.location.state.url_base + "api_tomo/train_rf/", par, config)
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
                state: { url_regreso: "/train_rf",
                         token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        }

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
                                        <h5 className="card-title"><b>Random forest</b></h5>
                                        
                                    <Formik
                                        initialValues={{n_estimators : 10, max_depth : 100000, min_split: 0, min_leaf: 0,
                                                        metrics: ['mse', 'acierto'], visibilidad: 'True', comentarios: ''}}
                                        validationSchema={Yup.object({
        
                                        n_estimators: Yup.number()
                                            .positive("Enter a positive number.")
                                            .integer("It must be an integer.")
                                            .min(1, 'The number of estimators must be equal or higher than 1.')
                                            .max(1000, 'The number of estimators must be equal or lower than 1000.')
                                            .required('Required field.'),
        
                                        max_depth: Yup.number()
                                            .positive("Enter a positive number.")
                                            .integer("It must be an integer.")
                                            .min(1, 'The maximum depth must be at least 1.')
                                            .max(100000, 'The maximum depth cannot be higher than 100000.')
                                            .required('Required field.'),
        
                                        min_split: Yup.number()
                                            .positive("Enter a positive number.")
                                            .integer("It must be an integer.")
                                            .min(0, 'It must be equal or higher than 0.')
                                            .max(1000, 'It must be equal or lower than 1000.')
                                            .required('Required field.'),
                                        min_leaf: Yup.number()
                                            .positive("Enter a positive number.")
                                            .integer("It must be an integer.")
                                            .min(0, 'It must be equal or higher than 0.')
                                            .max(1000, 'It must be equal or lower than 1000.')
                                            .required('Required field.'),
        
                                        visibilidad: Yup.string()
                                            .required('Required field.'),
                                        comentarios: Yup.string()
                                            .max(100, 'The comment cannot be longer than 100 characters.')
                                        
                                        })}
                                        onSubmit={(values, { setSubmitting }) => {
                                        setTimeout(() => {
                                            this.initiate_training_rf(values);
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
                                                    <label htmlFor="n_estimators" className="col-sm-6 col-form-label"> Number of estimators: </label>
                                                    <div className="col-sm-6">
                                                        <Field type = "number" className="form-control" name="n_estimators"/>
                                                        <span className = "error1"><ErrorMessage  name="n_estimators" /> </span>
                                                    </div>
                                                </div>
        
                                                <div className="form-group row">
                                                    <label htmlFor="max_depth" className="col-sm-6 col-form-label"> Maximum depth: </label>
                                                    <div className="col-sm-6">
                                                        <Field type = "number" className="form-control" name="max_depth"/>
                                                        <span className = "error1"><ErrorMessage  name="max_depth" /> </span>
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

export default TrainRF;
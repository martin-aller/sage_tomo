import React, { Component } from 'react'
import Header from '../management/Header';
import GoBackButton from '../management/GoBackButton';
import NoSession from '../management/NoSession'
import Loading from '../management/Loading'
import {Redirect} from "react-router-dom";
import { Formik, Field, Form, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';


class TrainDNN extends Component{
    //View with a form to define the training parameters for a neural network.

    constructor(props){
        super(props);
        this.state = {
            toTrainings: false,
            toTrainingDatasets: false,
            n_layers: 1,
            id_dataset: null,
            help_message: <p>In this window you can define the features for the neural network that you will train.</p>,
            

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


    ocultar_mostrar_batch_size(){
        var marcado = document.getElementById("training_batch_size").checked;
        if(marcado === false){
            document.getElementById("fila_batch_size").setAttribute("hidden", true);
        }else{
            document.getElementById("fila_batch_size").removeAttribute("hidden");
        }
    }


    initiate_training_dnn(values){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }
        

        var batch_size_aux = null;

        if(values.training_batch_size.length > 0){
            batch_size_aux = values.batch_size;
        }
        const par = {
            dataset: this.state.id_dataset,
            n_hidden_layers: values.neurons_per_layer.length,
            n_neuronas: values.neurons_per_layer,
            inside_activation_function: values.f_activacion_interna,
            outside_activation_function: values.f_activacion_externa,
            error_function: values.f_error,
            n_epochs: values.n_epochs,
            batch_size: batch_size_aux,
            learning_rate: values.learning_rate,
            momentum: values.momentum,
            metrics: values.metrics,
            comentarios: values.comentarios,
            visibilidad: values.visibilidad,

        }



        


        axios.post(this.props.location.state.url_base + "api_tomo/train_dnn/", par, config)
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
                state: { url_regreso: "/train_dnn",
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
                                        <h5 className="card-title"><b>Neural Network</b></h5>
                                        
                                    <Formik
                                        initialValues={{n_hidden_layers : 1, neurons_per_layer : [10], f_activacion_interna: 'relu', f_activacion_externa: 'relu', f_error: 'mse', 
                                            n_epochs : 20, 
                                             training_batch_size : '', batch_size: 64,learning_rate: 0.001,momentum: 0.9,
                                            metrics: ['mse', 'accuracy'], visibilidad: 'True', comentarios: ''}}
                                        validationSchema={Yup.object({
        
                                        neurons_per_layer: Yup.array()
                                            .of( Yup.number("Enter a positive integer")
                                                .positive("Enter a positive number.")
                                                .integer("It must be an integer.")
                                                .min(1, 'The minimum allowed number of neurons per layer is 1.')
                                                .max(1000, 'The maximum allowed number of neurons per layer is 1000.')                                             
                                            ),
        
                                        f_activacion_interna: Yup.string()
                                            .required('Required field.'),
                                        f_activacion_externa: Yup.string()
                                            .required('Required field.'),
                                        f_error: Yup.string()
                                            .required('Required field.'),
                                        n_epochs: Yup.number()
                                            .positive("Enter a positive number.")
                                            .integer("It must be an integer.")
                                            .min(1, 'The minimum allowed number of epochs is 1.')
                                            .max(1000, 'The maximum allowed number of epochs is 1000.')
                                            .required('Required field.'),
        
                                        batch_size: Yup.number()
                                            .positive("Enter a positive number.")
                                            .integer("It must be an integer.")
                                            .min(1, 'The minimum allowed batch size is 1.')
                                            .max(100, 'The maximum allowed batch size is 100.'),
                                            
                                        learning_rate: Yup.number()
                                            .positive("Enter a positive number.")
                                            .min(0.001, 'The minimum allowed value is 0.001.')
                                            .max(100, 'The maximum allowed values is 100.')
                                            .required('Required field.'),
                                        momentum: Yup.number()
                                            .positive("Enter a positive number.")
                                            .min(0.0, 'The minimum allowed value is 0.')
                                            .max(100, 'The maximum allowed value is 100.')
                                            .required('Required field.'),
                                        visibilidad: Yup.string()
                                            .required('Required field.'),
                                        comentarios: Yup.string()
                                            .max(100, 'The comment cannot be longer than 100 characters.')
                                        
                                        })}
                                        onSubmit={(values, { setSubmitting }) => {
                                        setTimeout(() => {
                                            this.initiate_training_dnn(values);
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
                                                    <label htmlFor="neurons_per_layer" className="col-sm-6 col-form-label"> Number of neurons per hidden layer: </label>
                                                    <div className="col-sm-6">
                                                        <FieldArray className="form-control"  name="neurons_per_layer">
                                                            {
                                                                (fieldArrayProps) =>{
                                                                    
                                                                    const {push, remove, form} = fieldArrayProps
                                                                    const {values} = form
                                                                    const { neurons_per_layer} = values
                                                                    return (
                                                                        <div>
                                                                            <button type = "button" className = "btn-sm btn-dark btn_neurona"  onClick = { () => form.values.neurons_per_layer.length < 3 && push("")}> Add layer</button>
        
                                                                            {
                                                                                neurons_per_layer.map((n_capa, index) => (
        
                                                                                    <div key = {index}>
                                                                                        <label><b>C{index}</b> &rarr; &nbsp; <Field name = {'neurons_per_layer[' + index + ']'} className = "campo_neurona" type = "number"/></label>
                                                                                        {index > 0 && index < 3 &&
                                                                                                <button type = "button"  onClick = {() => remove(index)} > - </button>
                                                                                        }
                                                                                        
        
                                                                                        
                                                                                    </div>
                                                                                ))
                                                                            }
                                                                        </div>)
                                                                }
                                                            }
                                                        </FieldArray>
                                                        <span className = "error1"><ErrorMessage  name="neurons_per_layer" /> </span>
        
                                                    </div>
                                                </div>
        
        
                                                <div className="form-group row">
                                                    <label htmlFor="inside_activation_function" className="col-sm-6 col-form-label"> Activation function for hidden layers: </label>
                                                    <div className="col-sm-6">
                                                        <Field className="form-control" name="inside_activation_function" as = "select">
                                                            <option value = "relu"> Rectified Linear Unit (ReLU) </option>
                                                            <option value = "tanh"> Hyperbolic tangent </option>
                                                            <option value = "sigmoid"> Sigmoid </option>
                                                            <option value = "exponential"> Exponential </option>
                                                            <option value = "linear"> Linear </option>
                                                        </Field>
                                                        <span className = "error1"><ErrorMessage  name="inside_activation_function" /> </span>
        
                                                    </div>
                                                </div>
        
        
            
        
                                                <div className="form-group row">
                                                    <label htmlFor="outside_activation_function" className="col-sm-6 col-form-label"> Activation function for output layer: </label>
                                                    <div className="col-sm-6">
                                                        <Field className="form-control"  name="outside_activation_function" as = "select" >
                                                            <option value = "relu"> Rectified Linear Unit (ReLU) </option>
                                                            <option value = "tanh"> Hyperbolic tangent </option>
                                                            <option value = "sigmoid"> Sigmoid </option>
                                                            <option value = "exponential"> Exponential </option>
                                                            <option value = "linear"> Linear </option>
                                                        </Field>
                                                        <span className = "error1"><ErrorMessage  name="outside_activation_function" /> </span>
        
                                                    </div>
                                                </div>
        
                                                <div className="form-group row">
                                                    <label htmlFor="error_function" className="col-sm-6 col-form-label"> Error function: </label>
                                                    <div className="col-sm-6">
                                                        <Field className="form-control" name="error_function" as = "select">
                                                            <option value = "mse"> Mean Squared Error </option>
                                                            <option value = "mean_absolute_error"> Mean Absolute Error </option>
                                                            <option value = "mean_absolute_percentage_error"> Mean Absolute Percentage Error </option>
                                                            <option value = "mean_squared_logarithmic_error"> Mean Squared Logarithmic Error </option>
                                                        </Field>
                                                        <span className = "error1"><ErrorMessage  name="error_function" /> </span>
        
                                                    </div>
        
                                                </div>
        
                                                <div className="form-group row">
                                                    <label htmlFor="n_epochs" className="col-sm-6 col-form-label"> Number of epochs: </label>
                                                    <div className="col-sm-6">
                                                        <Field type = "number" className="form-control" name="n_epochs"/>
                                                        <span className = "error1"><ErrorMessage  name="n_epochs" /> </span>
                                                    </div>
                                                </div>
                                            </div>
        
                                            
                                            {/*Right column*/}
                                            <div className="col-md-6">
                                                <div className="form-group row">
                                                    <label htmlFor="training_batch_size" className="col-sm-6 col-form-label"> Use batches: </label>
                                                    <div className="col-sm-6">
                                                        <div className="dropdown margin_top_0_5" >
                                                            <Field type="checkbox" value = "True" id = "training_batch_size" name = "training_batch_size" onClick = {() => this.ocultar_mostrar_batch_size()}/>
                                                            <span className = "font_size_0_9"> (Check the box if you want to use batches )</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-group row" id = "fila_batch_size" hidden>
                                                    <label htmlFor="batch_size" className="col-sm-6 col-form-label"> Batch size: </label>
                                                    <div className="col-sm-6">
                                                        <Field type = "number" className="form-control" name="batch_size"/>
                                                        <span className = "error1"><ErrorMessage  name="batch_size" /> </span>
        
                                                    </div>
                                                </div>
        
                                                <div className="form-group row">
                                                    <label htmlFor="learning_rate" className="col-sm-6 col-form-label"> Learning rate: </label>
                                                    <div className="col-sm-6">
                                                        <Field type = "number" className="form-control" name="learning_rate"  step = "0.001"/>
                                                        <span className = "error1"><ErrorMessage  name="learning_rate" /> </span>
        
                                                    </div>
                                                </div>
        
                                                <div className="form-group row">
                                                    <label htmlFor="learning_rate" className="col-sm-6 col-form-label"> Momentum: </label>
                                                    <div className="col-sm-6">
                                                        <Field type = "number" className="form-control" name="momentum"  step = "0.1"/>
                                                        <span className = "error1"><ErrorMessage  name="momentum" /> </span>
        
                                                    </div>
                                                </div>
        
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
                                                                        <Field type="checkbox" name = "metrics" value = "mse" checked onClick={() => {return false}}/> Mean Squared Error (required)
                                                                    </label>
                                                                </div>
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <Field type="checkbox" name = "metrics" value = "accuracy" checked onClick={() => {return false}}/> Accuracy (required)
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
                                                        <Field type = "text" className="form-control" name = "comentarios" />
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

export default TrainDNN;
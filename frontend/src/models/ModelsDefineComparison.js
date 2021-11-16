import React, { Component } from 'react'
import Header from '../management/Header';
import GoBackButton from '../management/GoBackButton';
import NoSession from '../management/NoSession'
import {Redirect} from "react-router-dom";
import axios from 'axios';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

class ModelsDefineComparison extends Component{
    //View with a form for defining the comparison parameters of several models.
    
    constructor(props){
        super(props);
        this.state = {
            models_list : [],
            datasets_list : [],
            id_dataset : null,
            id_dat_details: null,
            toComparisonFinished: false,
            type_container: null,
            loading_datasets: true,
            postprocessing: true,
            error_dataset: false,
            metrics_list : [],
            help_message: <div>In this window you can define certain parameters to define the comparison between the models selected 
                in the previous window. The comparisons between models consist of making predictions of the conductivity values for 
                all the meshes from a dataset and evaluating the predictions made by calculating one or more metrics. You can choose 
                the dataset to be used to evaluate the models, as well as the metrics by which the models will be evaluated. Moreover, 
                you can indicate whether you want to apply post-processing to the predictions made by the models.</div>
            
          }
        this.handleChangePostprocessing = this.handleChangePostprocessing.bind(this);

    }


    handleChangePostprocessing = e => {
        const { name, value } = e.target;
    
        this.setState({
          [name]: value
        });
        console.log("POST:", this.state.postprocessing)
      };


    componentDidMount(){
        var type_container_aux;
        this.consult_models();
        this.get_datasets();
        if(this.props.location.state.models_list.length === 2){
            type_container_aux = "container";
        }else{
            type_container_aux = "container-fluid";
        }
        this.setState({type_container: type_container_aux});
    }


    view_dataset_details(id){
        this.setState({id_dat_details : id});
    }


    consult_models(){
        var models_list_aux = [];
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }
        
        for(var id_model of this.props.location.state.models_list){
            axios.get(this.props.location.state.url_base + "api_tomo/models/" + id_model + "/", config)
            .then(
                response => {                 
                    models_list_aux.push(response.data);
                })
            .catch(error => {
                console.error('An error has occurred', error);
            });
        }

        this.setState({models_list: models_list_aux});
    }



    select_dataset(id){
        this.setState({id_dataset: id});
    }


    abre_metrics(){
        document.getElementById("dropdown-menu-metrics").classList.toggle("show");
    }



    get_datasets(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        axios.get(this.props.location.state.url_base + "api_tomo/datasets/", config)
        .then(
            response => {
                this.setState({datasets_list: response.data, loading_datasets: false});
            })
        .catch(error => {
            console.error('An error has occurred', error);
        });
    }



    get_date(datetime){
        var fecha = "";
        fecha = datetime.split("T")[0];
        return fecha;
    }



    render(){
        
        if (this.state.toComparisonFinished === true) {
            
            return <Redirect push to={{
                pathname: '/models_comparison_performed',
                state: { dataset: this.state.id_dataset,
                         models_list: this.state.models_list,
                         metrics_list: this.state.metrics_list,
                         postprocessing: this.state.postprocessing,
                         token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }


        if (this.state.id_dat_details !== null) {
            return <Redirect push to={{
                pathname: '/datasets/' + this.state.id_dat_details,
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Header with_account = {true} help_message = {this.state.help_message} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <GoBackButton/>
        
                        <h3 className = "text-center"> Models to compare: </h3>
                        <br/><br/>
                        <div className = {this.state.type_container}> {/*If there are three models at least, the container will be fluid, to put the models in the same line*/}
                            <div className = "row">
                                {this.state.models_list.map((m) =>
                                    <div className="card bg-light mx-auto mb-3 caja max_width_50" key = {m.generic_model.id}>
                                        <div className="card-body">
                                            <h5 className="card-title">Model {m.generic_model.id}</h5>
                                            <p className = "text-left"><b>Type</b>: {m.generic_model.type} </p>
                                            <p className = "text-left"><b>Training dataset</b>: {m.generic_model.dataset} </p>
                                        </div>
                                    </div>                        
                                )}
        
                            </div>
        
                        </div>
                        <br/>
                        <div className = "container" >
                            {this.state.models_list.map((m)=>
                                <input type="hidden" name="models_list" value = {m.generic_model.id} key = {m.generic_model.id}/>
        
                            )}
                            <div className="card bg-light mx-auto mb-3 caja max_width_50">
                                <div className="card-header">Comparison options</div>
                                <div className = "card-body">
                                    <div className = "row">
                                        <div className="col-md-12">
                                            <p className = "text-left"> Select a <b>dataset</b> to evaluate the models: </p>
                                            <br/>
                                        </div>
                                    </div>
                                    <div className = "row">
                                        <div className="col-md-12">
                                            {this.state.loading_datasets === true ? (
                                                <div className="row" id = "load">
                                                    <div className = "col text-center">
                                                        <div className="spinner-border text-dark loaddor" role="status">
                                                        </div>
                                                    </div>
                                                </div>
                                            ):(
                                                <table className = "table table-striped tabla_scroll_x tabla_scroll_y_20">
                                                    <thead>
                                                        <tr>
                                                            <th scope="col" className = "width_col"></th>
                                                            <th scope="col" className = "width_col">Id </th>
                                                            <th scope="col" className = "width_col">Creator </th>
                                                            <th scope="col" className = "width_col">Creation date </th>
                                                            <th scope="col" className = "width_col">Number of meshes </th>
                                                            <th scope="col" className = "width_col"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                            {this.state.datasets_list.map( (dataset) =>
                                                                <tr key = {dataset.id}>
                                                                    <td><input type="radio" name = "datasets_list" value = {dataset.id} 
                                                                        onClick = {() => this.select_dataset(dataset.id)}/>
                                                                    </td>
                                                              
                                                                    <th scope="row" >{dataset.id}</th>
                                                                    <td>{dataset.creator.username}</td>
                                                                    <td>{this.get_date(dataset.creation_date)}</td>
                                                                    <td>{dataset.n_meshes}</td>
                                                                    <td> <span className = "btn-link cursor_puntero" onClick = {() => this.view_dataset_details(dataset.id)}> View details</span> </td>
                                                                </tr>
                                                            )}
                                                    </tbody>
                                                </table>
                                            )}
                                            {this.state.error_dataset && 
                                                <div className = "row text-center margin_top_2">
                                                    <div className = "col-md-3"></div>
                                                    <div className="col-md-6">
                                                        <div className="alert alert-danger">
                                                            <p>You must select a dataset.</p>
                                                        </div>                                
                                                    </div>
                                                    <div className = "col-md-3"></div>
                                                </div>
                                            }                          
                                        </div>
                                    </div>
                                    <hr/>
                                    <div className = "row">
                                        <div className="col-md-9">
                                            <br/><br/>
                                            <p className = "text-left"> Indicate if you want to <b>postprocess</b> the predictions made by the models: </p>
                                            <br/>
                                        </div>
        
                                        <div className="col-md-3">
                                            <br/><br/>
                                                    <label>Yes <input type="radio" name = "postprocessing" value="True" className = "width_3"  onChange={this.handleChangePostprocessing} defaultChecked/> </label>
                                                    <label>No<input type="radio" name = "postprocessing" value="False" className = "width_3" onChange={this.handleChangePostprocessing} />  </label>
                                            <br/>
                                        </div>
                                    </div>
        
                                    <hr/>
        
                                  
                                            
                                    <Formik
                                            initialValues={{ metrics: []}}
                                            validationSchema={Yup.object({
                                            metrics: Yup.array().min(1, 'You must select at least two metrics'),
                                
                                            })}
                                            onSubmit={(values, { setSubmitting }) => {
                                            setTimeout(() => {
                                                this.setState({error_dataset: false});
                                                if(this.state.id_dataset === null){
                                                    this.setState({error_dataset: true});
                                                }else{
                                                    this.setState({metrics_list: values.metrics, toComparisonFinished: true});
                                                }   
                                                
                                                setSubmitting(false);
                                            });
                                            }}>
                                        <Form >
                                            <div className = "row">
                                                <div className="col-md-9">
                                                    <br/>
                                                    <p className = "text-left"> Select the <b>metrics</b> by which the models will be assessed: </p>
                                                    <br/><br/>
                                                </div>
        
                                                
                                                    <div className = "col-md-3">
                                                        <br/>
                                                        <div className="dropdown" id = "dropdown_metrics" name = "dropdown_metrics" >
                                                            <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu2" 
                                                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" onClick = {() => this.abre_metrics()}>
                                                                Choose one or more
                                                            </button>
                                                            <div className="dropdown-menu" id = "dropdown-menu-metrics" aria-labelledby="dropdownMenu2">
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <Field type="checkbox" name = "metrics" value = "mse" /> Mean Squared Error
                                                                    </label>
                                                                </div>
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <Field type="checkbox" name = "metrics" value = "accuracy" /> Accuracy
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
                                                        <span className = "error1"><ErrorMessage  name="metrics" /> </span>
        
                                                    </div>
                                                
                                            </div>
                                            <div className = "row">
                                                <div className="col-md-12 text-center">
                                                    <button type = "submit" className = "btn-lg btn-dark" id = "btn_define_comparison" >
                                                        Compare models
                                                    </button>
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

export default ModelsDefineComparison;
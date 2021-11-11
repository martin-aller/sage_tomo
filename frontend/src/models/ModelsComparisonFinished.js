import React, { Component} from 'react'
import Header from '../management/Header';
import GoBackButton from '../management/GoBackButton';
import NoSession from '../management/NoSession'
import {Redirect} from "react-router-dom";
import Loading from '../management/Loading'
import axios from 'axios';


class ModelsComparisonFinished extends Component{
     //View shown to the user after a comparison of several models.
    constructor(props){
        super(props);
        this.state = {
            models_list : [],
            metrics_list : [],
            comparison : null,
            performing_reconstruction: true,
            performing_comparison : true,
            type_container: null,
            urls_imgs: null,
            mesh_index: null,
            column_width: 3,
            error_model: false,
            help_message: <div>This window shows the results obtained for the comparison of the indicated models. The first table 
                shows the results obtained by each of the metrics for each of the models. In the case that in the previous window you 
                had selected the percentage of success as one of the metrics, a confusion matrix will also be displayed. In the lower 
                part of the window, you will be shown the reconstruction of the image of a mesh randomly selected from among the meshes
                of the dataset by which the comparison was made.  The first image shown is the actual image and the following images 
                are the images associated with the predictions made by each of the models.</div>

          }

          this.perform_comparison = this.perform_comparison.bind(this);
    }

    componentDidMount(){
        
        var type_container = null;
        var n_models = this.props.location.state.models_list.length;
        var longitud = -1;
        var mesh_index = 0; 
        var width;

        if(n_models === 4){
            type_container = "container-fluid card";
        }
        else{
            type_container = "container card caja";
        }

        width = this.get_column_width(n_models);
        longitud = this.get_dataset_length();
        longitud = 100;
        
        mesh_index = this.generate_random_mesh_index(longitud);
        
        this.perform_comparison();
        
        this.reconstruct_several_img(mesh_index);
        this.setState({type_container : type_container, mesh_index: mesh_index, column_width: width});
    }



    get_id_models(models_list){
        var list_ids = []
        for(var model of models_list){
            list_ids.push(parseInt(model.generic_model.id,10));//Second argument is the base for the conversion
        }
        list_ids.sort(function(a, b) {
            return a - b;
          })

        return list_ids;
    }


    
    get_column_width(longitud){
        var width = 3;
        if(longitud === 2){
            width = 6;
        }
        else if(longitud === 3){
            width = 4;
        }
        else if(longitud === 4){
            width = 3;
        }
        return width;
    }



    perform_comparison(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        axios.get(this.props.location.state.url_base + "api_tomo/compare_models/?dataset="+ this.props.location.state.dataset
                +"&models_list="+ this.get_id_models(this.props.location.state.models_list)
                +"&metrics_list="+ this.props.location.state.metrics_list
                +"&postprocessing=" + this.props.location.state.postprocessing, config)
        .then(
            response => {
                this.setState({comparison: response.data, metrics_list: response.data.metrics, performing_comparison: false});
            })
        .catch(error => {
            this.setState({error_model: true});
            console.error('An error has occurred', error);
        });
    }





    get_dataset_length(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        axios.get(this.props.location.state.url_base + "api_tomo/datasets/" + this.props.location.state.dataset + "/", config)
        .then(
            response => {
                return response.data.n_meshes;
            })
        .catch(error => {
            console.error('Se ha producido un error AL OBTENER LA LONGITUUUUUUUUUUUUUUUUUUUUUUUUUD  .', error);
        });
        
        return 0;
    }



    generate_random_mesh_index(longitud){
        var min=0;
        var max=longitud; //Number generated randomly will be lower than max.
        var random = Math.floor(Math.random() * (max - min + 1)) + min;

        return random;
    }



    reconstruct_several_img(mesh_index){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        axios.get(this.props.location.state.url_base + "api_tomo/reconstruct_img_multiple/?dataset="+ this.props.location.state.dataset
                +"&mesh_index=" + mesh_index
                +"&models_list=" + this.get_id_models(this.props.location.state.models_list)
                +"&postprocessing=" + this.props.location.state.postprocessing, config)
        .then(
            response => {
                this.setState({urls_imgs: response.data, performing_reconstruction: false});
            })
        .catch(error => {
            console.error('Se ha producido un erroren REC IMG.', error);
        });
    }




    round_num(num){
        return Math.round((num + Number.EPSILON) * 100) / 100; //Number.Epsilon para números como 1.005
    }



    calculate_percentage(mc, type){
        var total = mc.true_positives + mc.true_negatives + mc.false_positives + mc.false_negatives;
        var percentage = 0;

        if(type === "vp"){
            percentage = (mc.true_positives /total)*100;
        }
        else if(type === "vn"){
            percentage = (mc.true_negatives /total)*100;
        }
        else if(type === "fp"){
            percentage = (mc.false_positives /total)*100;
        }
        else if(type === "fn"){
            percentage = (mc.false_negatives /total)*100;
        }
        
        var percentage_redondo = Math.round((percentage + Number.EPSILON) * 100) / 100;

        return percentage_redondo;
    }



    render(){
        
        var message_model = "Some of the selected models is not in the system anymore.";
        if (this.state.error_model === true) {
            return <Redirect push to={{
                pathname: '/sin_model',
                state: { token: this.props.location.state.token, 
                        url_base: this.props.location.state.url_base,
                        message: message_model}
            }}/>        
        }

        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Header con_cuenta = {true} help_message = {this.state.help_message} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <GoBackButton/>
                        {this.state.performing_comparison === true ||  this.state.performing_reconstruction === true ? (
                            <Loading
                                completo = {true} 
                                cabecera = "Model comparison"
                                message = "Performing comparison. This operation may take a few seconds."
                            />
                        ):(
                        <div>
                            <div className="card bg-light mx-auto mb-3 caja max_width_50">
                                <div className="card-header">Comparison</div>
                                <div className="card-body">
                                    <h5 className="card-title">Evaluation results </h5>
                                    <div className="row">
                                        <div className="col-md-12 width_14">
                                            <table className = "table table-striped">
                                                <thead>
                                                <tr>
                                                    <th scope="col">Model ID</th>
                                                    <th scope="col"> Type </th>
                                                    {this.props.location.state.metrics_list.map((m, index) =>
                                                        <th scope="col" key = {index}>{m.toUpperCase()}</th>
                                                    )}
        
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.keys(this.state.comparison.metrics).map((id_model) => 
                                                    <tr key = {id_model}> 
                                                    
                                                        <td><b>{id_model}</b></td>
                                                        <td>{this.state.comparison.types[id_model]}</td>
                                                        {Object.keys(this.state.comparison.metrics[id_model]).map((name) =>
                                                            <td key = {name}> 
                                                                {this.round_num(this.state.comparison.metrics[id_model][name])}
                                                                {name === "accuracy" &&
                                                                    <div className = "en_linea">
                                                                        <span>%</span>
                                                                    </div>
                                                                }
                                                            
                                                            </td>
        
                                                        )} 
            
                                                    </tr>
                                                )}
            
                                            </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
        
                             {this.props.location.state.metrics_list.includes("accuracy") &&
                                <div>
                                <div className = {this.state.type_container}>
                                        <h5 className="card-title text-center">Confusion matrixes</h5>
                                        <div className="card-body">
                                            <div className="row" >
                                                {Object.keys(this.state.comparison.matrices_confusion).map((id_model) =>
                                                    <div className={"col-md-" + this.state.column_width + " width_14"} key = {id_model}>
        
                                                        <table className = "table table-bordered">
                                                            <caption className = "titulo_arriba"><b>Model {id_model}</b></caption>
                                                            <thead>
                                                                <tr>
                                                                    <th scope="col"></th>
                                                                    <th scope="col">Actual value (without artifact)</th>
                                                                    <th scope="col">Actual value (with artifact)</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <th> Prediction (without artifact) </th>
                                                                    <td> {this.state.comparison.matrices_confusion[id_model].true_negatives} ({this.calculate_percentage(this.state.comparison.matrices_confusion[id_model], "vn")}<span>%</span>)</td>
                                                                    <td> {this.state.comparison.matrices_confusion[id_model].false_negatives} ({this.calculate_percentage(this.state.comparison.matrices_confusion[id_model], "fn")}<span>%</span>)</td>
                                                                </tr>
                                                                <tr>
                                                                    <th> Prediction (with artifact)</th>
                                                                    <td> {this.state.comparison.matrices_confusion[id_model].false_positives} ({this.calculate_percentage(this.state.comparison.matrices_confusion[id_model], "fp")}<span>%</span>)</td>
                                                                    <td> {this.state.comparison.matrices_confusion[id_model].true_positives} ({this.calculate_percentage(this.state.comparison.matrices_confusion[id_model], "vp")}<span>%</span>)</td>
                                                                </tr>
                                                            </tbody>
                                                                             
        
                                                        </table>
                                                    </div>
                                                )}
        
        
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
        
                            <div className = "container card caja">
                                <h5 className="card-title text-center"> Reconstruction of random image from the dataset {this.props.location.state.dataset}: mesh {this.state.mesh_index}</h5>
                                <div className="card-body">
                                    <div className="row" >
                                        <div className="col-md-4"> </div>
                                        <div className="card col-md-4 caja width_14">
                                            <div className = "container">
                                                <p className="card-title text-center"><b>Actual image</b></p>
                                                <img className="card-img-top border border-dark img_rec text-center" src={"http://" + this.state.urls_imgs["url0"]} alt="Real mesh"/>
                                            </div>
                                        </div>
                                        <div className="col-md-4"> </div>
                                    </div>
                                    <br/>
        
                                    <div className="row" >
                                        {this.get_id_models(this.props.location.state.models_list).map((id_model, index) =>
                                            <div className={"card col-md-" + this.state.column_width + " caja width_14"} key = {id_model}>
                                                <div className = "container">
                                                    <p className="card-title text-center"><b>Prediction of the model {id_model}</b></p>
                                                    <img className="card-img-top border border-dark img_rec text-center" src={"http://" + this.state.urls_imgs["url" + (index + 1)]} alt="Model reconstruction"/>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div> 
        
                        </div>
                        )}
        
                    </div>
                ):(
                    <NoSession/>
                )}

            </div>
        );
    }
}

export default ModelsComparisonFinished;
import React, { Component } from 'react'
import Header from '../management/Header';
import GoBackButton from '../management/GoBackButton';
import NoSession from '../management/NoSession'
import ModalYesNo from '../management/ModalYesNo';

import axios from 'axios';
import {Redirect} from "react-router-dom";



class Models extends Component{
    //List of models available to the user.
    
    constructor(props){
        
        super(props);
        this.state = {
            models_list: [],
            list_selected_models: [],
            loading: true,
            id_details: null,
            type_model: "todos",
            type_search: "todos",
            showModal: false,
            id_remove: null,
            n_sel: 0,
            toRemovedModel: false,
            toModelTypes: false,
            toDefineComparation: false,
            error_selection: false,
            help_message: <div><p>This page shows the models that you have trained yourself or the public models trained by other 
                users. You can consult the detailed information of each model (dataset with which it was trained, results obtained 
                by the evaluation with metrics, etc) by clicking on View details.</p>
            <p>On the other hand, you have the possibility to delete the models that you have trained yourself.</p>
            <p>By clicking on the boxes on the left side of the table, you can select up to four models to compare using different 
                metrics.</p></div>

          }
          this.handleChangeModelType = this.handleChangeModelType.bind(this);
          this.handleChangeSearchType = this.handleChangeSearchType.bind(this);

    }

    handleChangeModelType(e){
        this.setState({type_model: e.target.value});
    }

    handleChangeSearchType(e){
        this.setState({type_search: e.target.value});
    }


    componentDidMount(){
        this.get_models();
    }


    get_models(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        axios.get(this.props.location.state.url_base + "api_tomo/models/", config)
        .then(
            response => {
                this.setState({models_list: response.data, loading: false});
            })
        .catch(error => {
            console.error('An error has occurred', error);
        });
    }



    
    filter_models(){
        this.setState({loading: true});
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        var url = "";

        if(this.state.type_search === "propios"){
            url = this.props.location.state.url_base + "api_tomo/models/?propios&type=" + this.state.type_model;
            
        }else{
            url = this.props.location.state.url_base + "api_tomo/models/?type=" + this.state.type_model;
            
        }

        axios.get(url, config)
        .then(
            response => {
                this.setState({models_list: response.data, loading: false});
            })
        .catch(error => {
            console.error('An error has occurred', error);
        });
    }




    view_model_details(id){
        this.setState({id_details : id});
    }

    setModal(state){
        this.setState({showModal: state});
    }

    setModalId(state,id){
        this.setState({showModal: state, id_remove: id});
    }


    remove_model(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }
        const id = this.state.id_remove;

        axios.delete(this.props.location.state.url_base + "api_tomo/models/" + id + "/", config)
        .then(
            response => {
                
                this.setState({toRemovedModel: true});

            })
        .catch(error => {
            
            console.error('An error has occurred', error);
        });   
    }



    selection_limit(id_input){
        var n_sel_aux = this.state.n_sel;
        var checkboxes = document.getElementsByName('models_list');


        if(document.getElementById(id_input).checked === true){ //Se marca un nuevo checkbox
            
            n_sel_aux++;

            if(n_sel_aux ===4){
                for (var checkbox of checkboxes) {
                    if (!checkbox.checked){
                        checkbox.disabled = true;
                    }
                }
            }

        }else{//A checkbox is unselected
            n_sel_aux--;
            if(n_sel_aux ===3){
                for (checkbox of checkboxes) {
                    if (!checkbox.checked){
                        checkbox.disabled = false;
                    }
                }
            }
        }

        this.setState({n_sel: n_sel_aux});   
    }



    access_define_comparation(){
        var list_aux = [];
        var checkboxes = document.getElementsByName('models_list');
        for (var checkbox of checkboxes) {
            if (checkbox.checked){
                list_aux.push(checkbox.value);
            }
        }
        
        if (list_aux.length >= 2){
            this.setState({list_selected_models: list_aux, toDefineComparation: true});
        }else{
            this.setState({error_selection:true});
        }

    }




    get_mse(model){
        for(var i = 0; i < model.metrics.length; i++){
            var m = model.metrics[i];
            if ( m.name === "mse"){
                return this.round_num(m.value);
            }
        }
        return null;
    }


    round_num(num){
        return Math.round((num + Number.EPSILON) * 100) / 100; //Number.Epsilon for numbers like 1.005
    }



    render(){
        
        if (this.state.id_details !== null) {
            return <Redirect push to={{
                pathname: '/models/' + this.state.id_details,
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        if (this.state.toRemovedModel === true) {
            return <Redirect push to={{
                pathname: '/object_removedo',
                state: { type_object: "model",
                         id: this.state.id_remove,
                         token: this.props.location.state.token, url_base: this.props.location.state.url_base
                         }
            }}/>
        }

        if (this.state.toModelTypes === true) {
            return <Redirect push to={{
                pathname: '/types_models',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        if (this.state.toDefineComparation === true) {
            return <Redirect push to={{
                pathname: '/models_definir_comparison',
                state: { models_list: this.state.list_selected_models, 
                         token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>
        }


        
        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Header con_cuenta = {true} help_message = {this.state.help_message} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <GoBackButton/>
        
                        
                        <ModalYesNo
                            show = {this.state.showModal}
                            si = {() => this.remove_model()}
                            no = {() => this.setModal(false)}
                            cabecera = "Eliminar model"
                            message = {"¿Deseas realmente remove el model con ID " + this.state.id_remove +"?"}
                        />
        
        
        
                        <div className="container card caja">
                                    <div className="card-body ">
                                        <h3 className="card-title titulo" > <b>Models</b> </h3>
                                        <div className = "row" >
                                            <div className="col-md-12 width_14">
                                                <form action="{% url 'tomo:filter_models' %}" method = "post" className = "margin_left_3">
                                                    <div className = "row">
                                                        <div className="col-md-6 width_14" >
                                                            <div className="form-group row">
                                                                <label htmlFor="type" className="col-sm-4 col-form-label"> Type of model: </label>
                                                                <div className="col-sm-8">
                                                                    <select id="type" name = "type" className="form-control"
                                                                     value={this.state.type_model} onChange={this.handleChangeModelType} >
                                                                        <option value = "todos"> All the models</option>
                                                                        <option value = "DNN"> Neural Networks </option>
                                                                        <option value = "RF"> Random Forests </option>
                                                                        <option value = "SVM"> Support vector machines </option>
                                                                    </select>
                                                                </div>
                                                            </div>
        
                                                            <div className="form-group row">
                                                                <label htmlFor="publico" className="col-sm-4 col-form-label">  Type of search: </label>
                                                                <div className="col-sm-8">
                                                                    <select id="publico" name = "publico" className="form-control"
                                                                    value={this.state.type_search} onChange={this.handleChangeSearchType} >
                                                                        <option  value = "todos"> Search among all the models </option>
                                                                        <option  value = "propios"> Search only among my models</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6 text-center my-auto width_14">
                                                                <input type="button" className="btn-lg btn-dark mb-2 " onClick= {() => this.filter_models()}
                                                                value = "Filter models"/> 
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
        
                                        <br/>
                                        <h5 className = "text-center"> You can select up to <b>four models</b> for comparing them. </h5>
                                        <br/>
        
                                        <form method= "post" action="{% url 'tomo:select_comparison' %}">
                                                <div className="row" >
                                                    <div className="col-md-12 width_14">
                                                            {this.state.loading === true ? (
                                                                <div className="row" id = "load">
                                                                    <div className = "col text-center">
                                                                        <div className="spinner-border text-dark loaddor" role="status">
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ):(
                                                                <div> 
                                                                    {this.state.models_list.length > 0 ? (
                                                                        <table className = "table table-striped tabla_scroll_y_20 tabla_scroll_x">
                                                                            <thead>
                                                                            <tr>
                                                                                <th scope="col">Select for comparison</th>
                
                                                                                <th scope="col">Id </th>
                                                                                <th scope="col">Type </th>
                                                                                <th scope="col">Dataset</th>
                                                                                <th scope="col">MSE </th>
                                                                                <th scope="col">Additional comments </th>
                                                                                <th scope="col">Creator </th>
                                                                                <th scope="col"></th>
                                                                                <th scope="col"></th>
                
                                                                            </tr>
                
                                                                            </thead>
                                                                            <tbody>
                                                                                {this.state.models_list.map( (model) => 
                                                                                <tr key = {model.id}>
                                                                                        <td><input type="checkbox" name = "models_list" id = {"input" + model.id} 
                                                                                                value = {model.id} onChange = {() => this.selection_limit("input" + model.id)}/></td>
                
                                                                                        <th scope="row">{model.id}</th>
                                                                                        <td>{model.type}</td>
                                                                                        <td>{model.dataset}</td>
                                                                                        <td>
                                                                                            {this.get_mse(model)}
                                                                                        </td>
                
                
                                                                                        <td>{model.comentaries}</td>
                                                                                        <td>{model.creator.username}</td>
                                                                                        <td> <span className = "btn-link cursor_puntero" onClick = {() => this.view_model_details(model.id)}> View details</span> </td>
                                                                            
                
                                                                                        {sessionStorage.usuario === model.creator.username ? (
                                                                                            <td><span className = "btn-link cursor_puntero"  onClick = {() => this.setModalId(true, model.id)}> Remove model</span></td>
                                                                                        ):(
                                                                                            <td></td>
                                                                                        )}
                                                                            
                                                                                    </tr>
                                                                                )}
                
                                                                            </tbody>
                                                                        </table>
                                                                    ):(
                                                                        <div className = "row text-center">
                                                                                    <div className = "col-sm-2"></div>
                                                                                    <p className = "col-sm-8 alert alert-primary sin_elementos"  role = "alert"> 
                                                                                    There are no models that comply with the filters.
                                                                                    </p>
                                                                                    <div className = "col-sm-2"></div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                
        
                                                            )}
                
                                                    </div>
                                                </div>
                                        </form>
        
        
                                    </div>
                        </div>
        
                                <div className = "container margin_top_1">
                                    { this.state.error_selection === true &&
                                        <div className = "row">
                                            <div className="col-md-12 text-center my-auto width_14" >
                                                    <div className="alert alert-danger" role="alert" id = "error_message_selection">
                                                        You must select at least <b> two </b> models to carry out the comparison.
                                                    </div>
        
                                            </div>
                                        </div> 
                                    }
                                    <div className = "row">
                                        <div className="col-md-6 text-center my-auto width_14">
                                            <button type = "submit" className="btn-lg btn-dark mb-2 sin_decoracion"  onClick = {() => this.access_define_comparation()}> 
                                                Compare models 
                                            </button>
                                        </div>
        
                                        <div className="col-md-6 text-center my-auto width_14">
                                            <input type = "button" className="btn-lg btn-dark mb-2 puntero_cursor" value = "Train new model" onClick = {() => this.setState({toModelTypes : true})}/>      
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

export default Models;
import React, { Component } from 'react'
import Header from '../management/Header';
import GoBackButton from '../management/GoBackButton';
import NoSession from '../management/NoSession'

import axios from 'axios';
import {Redirect} from "react-router-dom";



class ModelsRecImg extends Component{
    //List of models displayed to the user to select one of them to reconstruct an image.
    
    constructor(props){
        
        super(props);
        this.state = {
            models_list: [],
            loading: true,
            id_details: null,
            id_selected: null,
            error_selection: false,
            help_message: <p>In order to reconstruct images, you must select a model. The models you can select are those you have trained 
                            yourself or public models trained by other users.</p>,

          }
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



    ver_details_model(id){
        this.setState({id_details : id});
    }


    obtiene_mse(model){
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

    select_model(){
        var grupo = document.getElementsByName('models_list');
        var model = null;

        this.setState({error_selection:false});
        
        for (var i=0; i<grupo.length; i++) {
            if (grupo[i].type === 'radio' && grupo[i].checked) {
                
                model = grupo[i].value;
                break;
            }
        }
        
        if(model === null){
            this.setState({error_selection:true});
        }else{
            this.setState({id_selected:model});
        }
        
    }



    render(){
        
        if (this.state.id_details !== null) {
            return <Redirect push to={{
                pathname: '/models/' + this.state.id_details,
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }


        if (this.state.id_selected !== null) {
            return <Redirect push to={{
                pathname: "/rec_img_types",
                state: { id_model: this.state.id_selected, 
                         token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>
        }


        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Header con_cuenta = {true} help_message = {this.state.help_message} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <GoBackButton/>
        
        
                        <div className="container card caja">
                                    <div className="card-body ">
                                        <h3 className="card-title titulo"> <b>Reconstruction of images</b> </h3>
                                        <h5 className="card-title"><b>Model selection</b></h5>
                                        <p className="card-text">Select a model to make the predictions for the reconstruction of images:</p>
        
                                        <div> {this.state.models_list.length > 0 ? (
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
                                                                    <table className = "table table-striped tabla_scroll_y_20 tabla_scroll_x">
                                                                        <thead>
                                                                        <tr>
                                                                            <th scope="col" className = "width_col"></th>
            
                                                                            <th scope="col" className = "width_col">Id </th>
                                                                            <th scope="col" className = "width_col">Type </th>
                                                                            <th scope="col" className = "width_col">Dataset</th>
                                                                            <th scope="col" className = "width_col">MSE </th>
                                                                            <th scope="col" className = "width_col">Additional comments </th>
                                                                            <th scope="col" className = "width_col">Creator </th>
                                                                            <th scope="col" className = "width_col"></th>
            
                                                                        </tr>
            
                                                                        </thead>
                                                                        <tbody>
                                                                            {this.state.models_list.map( (model) => 
                                                                            <tr key = {model.id}>
                                                                                    <td><input type="radio" name = "models_list" value = {model.id}/></td>
            
                                                                                    <th scope="row">{model.id}</th>
                                                                                    <td>{model.type}</td>
                                                                                    <td>{model.dataset}</td>
                                                                                    <td>
                                                                                        {this.obtiene_mse(model)}
                                                                                    </td>
            
            
                                                                                    <td>{model.comentaries}</td>
                                                                                    <td>{model.creator.username}</td>
                                                                                    <td> <span className = "btn-link cursor_puntero" onClick = {() => this.ver_details_model(model.id)}> View details</span> </td>
                                                                        
            
                                                                        
                                                                                </tr>
                                                                            )}
            
                                                                        </tbody>
                                                                    </table>
            
                                                                )}
            
            
                                                                {this.state.error_selection && 
                                                                    <div className = "row text-center margin_top_2">
                                                                        <div className = "col-md-3"></div>
                                                                        <div className="col-md-6">
                                                                            <div className="alert alert-danger">
                                                                                <p>You must select a model.</p>
                                                                            </div>                                
                                                                        </div>
                                                                        <div className = "col-md-3"></div>
                                                                    </div>
                                                                }
            
                                                        </div>
                                                    </div>
                                            </form>
                                        ):(
                                            <div className = "row text-center">
                                                        <div className = "col-sm-2"></div>
                                                        <p className = "col-sm-8 alert alert-primary sin_elementos"  role = "alert"> 
                                                        There are currently no models stored in the system.
                                                        </p>
                                                        <div className = "col-sm-2"></div>
                                            </div>
                                        )}
                                        </div>

                                        
        
        
                                    </div>
                        </div>
        
                            <div className = "row text-center margin_top_2">
                                {this.state.models_list.length > 0 ? (
                                    <div className="col-md-12">
                                        <input type="button" className="btn-lg btn-dark  mb-2" id = "btn_dataset" value= "Select model" onClick = {() => this.select_model()}/>
                                    </div>
                                ):(
                                    <div></div>
                                )}

                            </div>                 
        
                    </div>
                ):(
                    <NoSession/>
                )}

            </div>
        );
    }
}

export default ModelsRecImg;
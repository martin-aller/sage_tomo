import React, { Component } from 'react'
import Header from '../management/Header';
import GoBackButton from '../management/GoBackButton';
import NoSession from '../management/NoSession'
import axios from 'axios';
import {Redirect} from "react-router-dom";



class DatasetsTraining extends Component{
    //View with the list of datasets. Users can select the dataset they want to use to train a new model. 
    //This view is accessed from the view of definition of a model's parameters.
    
    constructor(props){
        
        super(props);
        this.state = {
            datasets_list: [],
            loading: true,
            id_details: null,
            id_selected: null,
            error_selection: false,

          }

    }

    componentDidMount(){
        this.get_datasets();
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
                
                this.setState({datasets_list: response.data, loading: false});

            })
        .catch(error => {
            console.error('An error has occurred', error);
        });
    }

    view_dataset_details(id){
        this.setState({id_details : id});
    }


    select_dataset(){
        var grupo = document.getElementsByName('datasets_list');
        var dataset = null;

        this.setState({error_selection:false});
        
        for (var i=0; i<grupo.length; i++) {
            if (grupo[i].type === 'radio' && grupo[i].checked) {
                
                dataset = grupo[i].value;
                break;
            }
        }
        
        if(dataset === null){
            this.setState({error_selection:true});
        }else{
            
            this.setState({id_selected:dataset});
        }
        
    }


    get_date(datetime){
        var fecha = "";
        fecha = datetime.split("T")[0];
        return fecha;
    }



    render(){
        
        if (this.state.id_details !== null) {
            return <Redirect push to={{
                pathname: '/datasets/' + this.state.id_details,
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        if (this.state.id_selected !== null) {
            return <Redirect push to={{
                pathname: this.props.location.state.url_regreso,
                state: { id_dataset: this.state.id_selected,
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
                            <div className = "row">
                                <div className="card col-md-12 caja" >
                                <div className="card-body">
                                    <h5 class="card-title">Select a dataset for training the model: </h5>
                                    {this.state.loading === true ? (
                                        <div className="row" id = "load">
                                            <div className = "col text-center">
                                                <div className="spinner-border text-dark loaddor" role="status">
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <table className = "table table-striped tabla_scroll_x tabla_scroll_y">
                                            <thead>
                                                <tr>
                                                    <th scope="col" className = "width_col"></th>
                                                    <th scope="col" className = "width_col">Id </th>
                                                    <th scope="col" className = "width_col">Creator </th>
                                                    <th scope="col" className = "width_col">Creation Date </th>
                                                    <th scope="col" className = "width_col">Number of meshes </th>
                                                    <th scope="col" className = "width_col"></th>
        
        
                                                </tr>
                                            </thead>
        
                                            <tbody>
        
                                                    {this.state.datasets_list.map( (dataset) =>
                                                        <tr key = {dataset.id}>
                                                            <td><input type="radio" name = "datasets_list" value = {dataset.id}/></td>
                                                            <th scope="row" >{dataset.id}</th>
        
                                                            <td>{dataset.creator.username}</td>
                                                            <td>{this.get_date(dataset.creation_date)}</td>
                                                            <td>{dataset.n_meshes}</td>
                                                            <td> <span className = "btn-link cursor_puntero" onClick = {() => this.view_dataset_details(dataset.id)}> Ver details</span> </td>
        
        
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
                                                    <p>Debes select un dataset.</p>
                                                </div>                                
                                            </div>
                                            <div className = "col-md-3"></div>
                                        </div>
                                    }
                                       <div class = "row text-center margin_top_2">
                                        <div class="col-md-12">
                                            <input type="button" class="btn btn-dark  mb-2" id = "btn_dataset" value= "Select dataset" onClick = {() => this.select_dataset()}/>
                                        </div>
                                    </div>
                                </div>
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

export default DatasetsTraining;
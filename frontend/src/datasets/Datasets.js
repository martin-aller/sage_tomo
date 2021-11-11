import React, { Component } from 'react'
import Header from '../management/Header';
import GoBackButton from '../management/GoBackButton';
import NoSession from '../management/NoSession'
import ModalYesNo from '../management/ModalYesNo';

import axios from 'axios';
import {Redirect} from "react-router-dom";



class Datasets extends Component{
    //View with the list of available datasets for the user
    
    constructor(props){
        
        super(props);
        this.state = {
            datasets_list: [],
            loading: true,
            id_details: null,
            showModal: false,
            id_remove: null,
            id_download: null,
            toRemovedDataset: false,
            toGenerateDataset: false,
            toUploadDataset: false,
            help_message: <div> <p>This page shows the datasets that you have generated or uploaded or the public datasets generated 
                                    or uploaded by other users.</p>
                            <p>You can consult the detailed information about each dataset (number of bodies with one, two and 
                                three artifacts, minimum and maximum radius of the artifacts, etc). You can also download in 
                                CSV format any of the datasets in the list. In each of the lines of the downloaded CSV, the 
                                information of a mesh will be included: voltages, conductivities and number of artifacts. 
                                These values will be separated by semicolons.</p>
                            <p>On the other hand, in this window you also have the possibility to delete the datasets that you have trained yourself.</p></div>

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

    setModal(state){
        this.setState({showModal: state});
    }

    setModalId(state,id){
        this.setState({showModal: state, id_remove: id});

    }



    remove_dataset(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }
        const id = this.state.id_remove;

        axios.delete(this.props.location.state.url_base + "api_tomo/datasets/" + id + "/", config)
        .then(
            response => {
                
                this.setState({toRemovedDataset: true});

            })
        .catch(error => {
            console.error('An error has occurred', error);
        });   
    }

    access_generate_dataset(){
        this.setState({toGenerateDataset: true});
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


        if (this.state.toRemovedDataset === true) {
            return <Redirect push to={{
                pathname: '/object_removedo',
                state: { type_object: "dataset",
                         id: this.state.id_remove,
                         token: this.props.location.state.token,
                         url_base: this.props.location.state.url_base
                         }
            }}/>
        }


        if (this.state.toGenerateDataset === true) {
            return <Redirect push to={{
                pathname: '/dataset_generar',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }



        if (this.state.toUploadDataset === true) {
            return <Redirect push to={{
                pathname: '/dataset_subir',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }


        if (this.state.id_download !== null) {
            return <Redirect push to={{
                pathname: '/dataset_download/' + this.state.id_download,
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
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
                            si = {() => this.remove_dataset()}
                            no = {() => this.setModal(false)}
                            cabecera = "Remove dataset"
                            message = {"¿Do you really want to remove the dataset with ID " + this.state.id_remove +"?"}
                        />
        
        
                        <div className="container">
                            <div className = "row">
                                <div className="card col-md-12 caja" >
                                <div className="card-body">
                                    <h3 className="card-title titulo" > <b>Datasets</b> </h3>
                                    {this.state.loading === true ? (
                                        <div className="row" id = "load">
                                            <div className = "col text-center">
                                                <div className="spinner-border text-dark loaddor" role="status">
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            {this.state.datasets_list.length > 0 ? (
                                                <table className = "table table-striped tabla_scroll_x tabla_scroll_y">
                                                    <thead>
                                                        <tr>
                                                            <th scope="col" className = "width_col">Id </th>
                                                            <th scope="col" className = "width_col">Creator </th>
                                                            <th scope="col" className = "width_col">Creation date </th>
                                                            <th scope="col" className = "width_col">Number of meshes </th>
                                                            <th scope="col" className = "width_col"></th>
                                                            <th scope="col" className = "width_col"></th>
                                                            <th scope="col" className = "width_col"></th>
                
                                                        </tr>
                                                    </thead>
                
                                                    <tbody>
                
                                                        {this.state.datasets_list.map( (dataset) =>
                                                            <tr key = {dataset.id}>
                                                                <th scope="row" >{dataset.id}</th>
                
                                                                <td>{dataset.creator.username}</td>
                                                                <td>{this.get_date(dataset.creation_date)}</td>
                                                                <td>{dataset.n_meshes}</td>
                                                                <td> <span className = "btn-link cursor_puntero" onClick = {() => this.view_dataset_details(dataset.id)}> View details</span> </td>
                
                                                                <td> <span  className = "btn-link cursor_puntero" onClick={() => this.setState({id_download: dataset.id})}> Download</span> </td>
                
                                                                {sessionStorage.usuario === dataset.creator.username ? (
                                                                    <td><span className = "btn-link cursor_puntero"  onClick = {() => this.setModalId(true, dataset.id)}> Remove dataset</span></td>
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
                                                        There are currently no datasets stored in the system.
                                                        </p>
                                                        <div className = "col-sm-2"></div>
                                                </div>
                                            )}
                                        </div>


                                    )}
                                   
                                </div>
                                </div>
                            </div>
                        </div>
        
                        <div className = "container container_botones_dat">
                            <div className = "row">
                                <div className="col-md-6 text-center my-auto width_14">
                                    <span  className="btn-lg btn-dark mb-2 sin_decoracion cursor_puntero" onClick = {() =>this.setState({toUploadDataset:true})}>Upload dataset</span>
                                </div>
        
                                <div className="col-md-6 text-center my-auto width_14">
                                    <span className="btn-lg btn-dark mb-2 sin_decoracion cursor_puntero" onClick = {() =>this.access_generate_dataset()}>Generate dataset</span>
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

export default Datasets;
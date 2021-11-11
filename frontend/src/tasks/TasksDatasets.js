import React, { Component } from 'react'
import Header from '../management/Header';
import GoBackButton from '../management/GoBackButton';
import NoSession from '../management/NoSession'
import ModalYesNo from '../management/ModalYesNo';

import {Redirect} from "react-router-dom";
import axios from 'axios';


class TasksDatasets extends Component{
    //View of user tasks related to datasets (uploads and generation).

    constructor(props){
        
        super(props);
        this.state = {
            ongoing: [],
            finished: [],
            loading: false,
            id_details: null,
            id_discard: null,
            id_cancel: null,
            toDatasetDiscarded: false,
            showModalCancel: false,
            showModalDiscard: false,
            help_message: <div>The upper table of this window shows the list of datasets that are in the process of being 
                uploaded or generated. If you do not want to continue with any of the tasks in progress, click on Cancel 
                task in the row of the corresponding dataset. The lower table of the window shows the datasets already 
                uploaded or generated. You will not be able to make use of a generated dataset until you select the Save dataset 
                option.

            </div>
          }
    }

    componentDidMount(){
        this.get_ongoing_tasks();
        this.get_finished_tasks();
        this.setState({loading: false});
    }



    get_ongoing_tasks(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        axios.get(this.props.location.state.url_base + "api_tomo/datasets_generating/", config)
        .then(
            response => {
                this.setState({ongoing: response.data});
            })
        .catch(error => {
            console.error('An error has occurred', error);
        });
    }



    get_finished_tasks(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        axios.get(this.props.location.state.url_base + "api_tomo/datasets_pending/", config)
        .then(
            response => {
                this.setState({finished: response.data});
            })
        .catch(error => {
            
            console.error('An error has occurred', error);
        });
    }

    view_dataset_details(id){
        this.setState({id_details : id});
    }

    setModalDiscard(state){
        this.setState({showModalDiscard: state});
    }

    setModalDiscardId(state,id){
        this.setState({showModalDiscard: state, id_discard: id});

    }

    setModalCancel(state){
        this.setState({showModalCancel: state});
    }

    setModalCancelId(state,id){
        this.setState({showModalCancel: state, id_cancel: id});

    }



    discard_dataset(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }
        const id = this.state.id_discard;

        axios.delete(this.props.location.state.url_base + "api_tomo/datasets/" + id + "/", config)
        .then(
            response => {
                this.setState({toDatasetDiscarded: true});
            })
        .catch(error => {
            console.error('An error has occurred', error);
        });   
    }



    save_dataset(id){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        const par = {
            state: 'finished', 

        }

        axios.patch(this.props.location.state.url_base + "api_tomo/datasets/" + id + "/", par, config)
        .then(
            response => {
                this.setState({loading: true});
                this.get_ongoing_tasks();
                this.get_finished_tasks();
                this.setState({loading: false});

            })
        .catch(error => {
            console.error('An error has occurred', error);
        }); 
    }


    cancel_task(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }
        const id = this.state.id_cancel;

        axios.delete(this.props.location.state.url_base + "api_tomo/cancel_dataset_task/" + id + "/", config)
        .then(
            response => {
                
                this.setState({loading: true});
                this.get_ongoing_tasks();
                this.get_finished_tasks();
                this.setState({loading: false, showModalCancel : false});
            })
        .catch(error => {
            
            console.error('An error has occurred', error);
        });   
    }


    refresh(){
        this.setState({loading: true});
        setTimeout(() => {
            this.get_ongoing_tasks();
            this.get_finished_tasks();
            this.setState({loading: false, showModalCancel : false});
        }, 50);

    }


    format_datetime(datetime){
        var datetime_formatdo = "";
        datetime_formatdo = datetime.replace("T", ", ");
        datetime_formatdo = datetime_formatdo.replace("Z", "").split(".")[0];
        return datetime_formatdo;
    }



    render(){
        
        if (this.state.id_details !== null) {
            return <Redirect push to={{
                pathname: '/datasets/' + this.state.id_details,
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        if (this.state.toDatasetDiscarded === true) {
            return <Redirect push to={{
                pathname: '/object_descartado',
                state: { type_object: "dataset", id: this.state.id_discard, token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>
        }

        
        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Header con_cuenta = {true} help_message = {this.state.help_message} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <div className = "fixed-top top_5_5" >
                            <GoBackButton sin_espaciado = {true}/>
                 
                        </div>
                        <div className = "fixed-top top_8" >
                            <span className = "btn btn-dark btn-sm  btn_refresh" onClick = {() => this.refresh()}> 
                                <img className="img-responsive btn_refresh_img" src={process.env.PUBLIC_URL + '/images/reload.png'}  width = "20rem" alt = "button_refresh"/> Refresh
                            </span>                 
                        </div>

                
                        <ModalYesNo
                            show = {this.state.showModalCancel}
                            si = {() => this.cancel_task()}
                            no = {() => this.setModalCancel(false)}
                            cabecera = "Cancel task"
                            message = {"¿Do you really wish to cancel dataset " + this.state.id_cancel +" task?"}
                        />
        
                        <ModalYesNo
                            show = {this.state.showModalDiscard}
                            si = {() => this.discard_dataset()}
                            no = {() => this.setModalDiscard(false)}
                            cabecera = "Discard dataset"
                            message = {"¿Do you really wish to discard dataset " + this.state.id_discard +"?"}
                        />
        
        
        
                        <div className="container">
                            <div className = "row card caja">
                                <div className="card-body ">
                                    <h4 className="card-title titulo">Datasets in the process of being uploaded or generated  </h4>
                                    {this.state.loading === true ? (
                                        <div className="row" id = "load">
                                            <div className = "col text-center">
                                                <div className="spinner-border text-dark loaddor" role="status">
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            {this.state.ongoing.length > 0 ? (
                                                <table className = "table table-striped tabla_scroll_x tabla_scroll_y_20">
                                                    <thead>
                                                    <tr>
                                                        <th scope="col" className = "width_col2">Id </th>
                                                        <th scope="col" className = "width_col2">Start of the task</th>
                                                        <th scope="col" className = "width_col2"></th>
                                                        <th scope="col" className = "width_col2"></th>
                                    
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.ongoing.map((d) =>
                                                        <tr key = {d.id}>
                                                            <th scope="row">{d.id}</th>
                                                            <td >{this.format_datetime(d.creation_date)}</td>
                                                            <td >	
                                                                <span className = "btn-link cursor_puntero" onClick = {() => this.view_dataset_details(d.id)}> View details</span>
                                                            </td>
                                                            <td className = "width_col2">
                                                                <span className = "btn-link cursor_puntero"  onClick = {() => this.setModalCancelId(true, d.id)}> Cancel task</span>
                                                            </td>
        
                                                        </tr>                                    
                                                    )}
                
                                                </tbody>
                                                </table>
                                            ):(
                                                <div className = "row text-center">
                                                    <div className = "col-sm-2"></div>
                                                    <p className = "col-sm-8 alert alert-primary sin_elementos"  role = "alert"> 
                                                    There are currently no datasets in the process of being uploaded or generated.
                                                    </p>
                                                    <div className = "col-sm-2"></div>
                                                </div>
                                            )}
                                        </div>
                                    )}
        
        
                                </div>
                            </div>
                        </div>
                        <br/>
                        <br/>
                        <br/>
                        <div className="container">
                            <div className = "row card caja">
                                <div className="card-body ">
                                    <h4 className="card-title titulo">Uploaded or generated datasets </h4>
                                    {this.state.loading === true ? (
                                        <div className="row" id = "load">
                                            <div className = "col text-center">
                                                <div className="spinner-border text-dark loaddor" role="status">
                                                </div>
                                            </div>
                                        </div>                                
                                    ):(
                                        <div>
        
                                            {this.state.finished.length > 0 ? (
                                                <table className = "table table-striped tabla_scroll_x tabla_scroll_y_20">
                                                <thead>
                                                <tr>
        
                                                    <th scope="col" className = "width_col2">Id </th>
                                                    <th scope="col" className = "width_col2">Start of the task</th>
                                                    <th scope="col" className = "width_col2">Number of meshes </th>
                                                    <th scope="col" className = "width_col2"></th>
                                                    <th scope="col" className = "width_col2"></th>
                                                    <th scope="col" className = "width_col2"></th>
        
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.state.finished.map((d) => 
                                                        <tr key = {d.id}>
                                                            <th scope="row">{d.id}</th>
                                                            <td>{this.format_datetime(d.creation_date)}</td>
                                                            <td>{d.n_meshes}</td>
        
                                                            <td>
                                                                <span className = "btn-link cursor_puntero" onClick = {() => this.view_dataset_details(d.id)}> View details</span>
                                                            </td>
                                                            <td>
                                                                <span className = "btn-link cursor_puntero" onClick = {() => this.save_dataset(d.id)}> Save dataset</span>
                                                            </td>
                                                            <td>
                                                                <span className = "btn-link cursor_puntero"  onClick = {() => this.setModalDiscardId(true, d.id)}> Discard dataset</span>
                                                            </td>
        
                                                       
        
                                                        </tr>
                                                )}
        
                                            </tbody>
                                            </table>
                                            ):(
                                                <div className = "row text-center">
                                                    <div className = "col-sm-2"></div>
                                                    <p className = "col-sm-8 alert alert-primary sin_elementos" role = "alert"> 
                                                        There are currently no completed tasks.
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
                ):(
                    <NoSession/>
                )}

            </div>
        );
    }
}

export default TasksDatasets;
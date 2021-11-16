import React, { Component } from 'react'
import Header from '../management/Header';
import GoBackButton from '../management/GoBackButton';
import NoSession from '../management/NoSession'
import ModalYesNo from '../management/ModalYesNo';

import {Redirect} from "react-router-dom";
import axios from 'axios';


class TasksModels extends Component{
    //View with the user's trainings.
    
    constructor(props){
        
        super(props);
        this.state = {
            ongoing: [],
            finished: [],
            loading: false,
            id_details: null,
            id_discard: null,
            id_cancel: null,
            aModelDescartado: false,
            showModalCancel: false,
            showModalDiscard: false,
            help_message: <div>The upper table from this window shows the list of your models that are in training. If you do not 
                wish to continue with any of the training processes, click on Cancel training in the row of the corresponding model. 
                The list of completed training processes is displayed in the lower table of the window. For each of the completed training 
                processes, you have the option of either to save the trained model or to discard it.</div>
          }
    }

    componentDidMount(){
        this.get_ongoing_trainings();
        this.get_finished_trainings();
        this.setState({loading: false});
    }


    get_ongoing_trainings(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        axios.get(this.props.location.state.url_base + "api_tomo/models_training/", config)
        .then(
            response => {
                this.setState({ongoing: response.data});
            })
        .catch(error => {
            console.error('An error has occurred', error);
        });
    }


    get_finished_trainings(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        axios.get(this.props.location.state.url_base + "api_tomo/models_pending/", config)
        .then(
            response => {
                this.setState({finished: response.data});
            })
        .catch(error => {
            console.error('An error has occurred', error);
        });
    }

    ver_details_model(id){
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



    discard_model(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }
        const id = this.state.id_discard;

        axios.delete(this.props.location.state.url_base + "api_tomo/models/" + id + "/", config)
        .then(
            response => {
                this.setState({aModelDescartado: true});
            })
        .catch(error => {
            console.error('An error has occurred', error);
        });   
    }



    save_model(id){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        const par = {
            state: 'finished', 

        }

        axios.patch(this.props.location.state.url_base + "api_tomo/models/" + id + "/", par, config)
        .then(
            response => {
                this.setState({loading: true});
                this.get_ongoing_trainings();
                this.get_finished_trainings();
                this.setState({loading: false});

            })
        .catch(error => {
            console.error('An error has occurred', error);
        }); 
    }



    cancel_training(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }
        const id = this.state.id_cancel;

        axios.delete(this.props.location.state.url_base + "api_tomo/cancel_training/" + id + "/", config)
        .then(
            response => {
                this.setState({loading: true});
                this.get_ongoing_trainings();
                this.get_finished_trainings();
                this.setState({loading: false, showModalCancel : false});
            })
        .catch(error => {
            console.error('An error has occurred', error);
        });   
    }



    refresh(){
        this.setState({loading: true});
        this.get_ongoing_trainings();
        this.get_finished_trainings();
        this.setState({loading: false, showModalCancel : false});
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
                pathname: '/models/' + this.state.id_details,
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        if (this.state.aModelDescartado === true) {
            return <Redirect push to={{
                pathname: '/object_discarded',
                state: { type_object: "model", id: this.state.id_discard, token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>
        }

        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Header with_account = {true} help_message = {this.state.help_message} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
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
                            si = {() => this.cancel_training()}
                            no = {() => this.setModalCancel(false)}
                            cabecera = "Cancel training"
                            message = {"¿Do you really wish to cancel the training of the model with ID " + this.state.id_cancel +"?"}
                        />
        
                        <ModalYesNo
                            show = {this.state.showModalDiscard}
                            si = {() => this.discard_model()}
                            no = {() => this.setModalDiscard(false)}
                            cabecera = "Discard model"
                            message = {"¿Do you really wish to discard the model with ID " + this.state.id_discard +"?"}
                        />
        
        
                        <div className="container">
                            <div className = "row card caja">
                                <div className="card-body ">
                                    <h4 className="card-title titulo">Ongoing trainings </h4>
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
                                                            <th scope="col" className = "width_col2"> Id </th>
                                                            <th scope="col" className = "width_col2"> Type </th>
                                                            <th scope="col" className = "width_col2"> Training start</th>
                                                            <th scope="col" className = "width_col2"> Additional comments </th>
                                                            <th scope="col" className = "width_col2"></th>
                                                            <th scope="col" className = "width_col2"></th>
                    
                                                        </tr>
                                                    </thead>
                                                <tbody>
                                                    {this.state.ongoing.map((e) =>
                                                        <tr key = {e.id}>
                                                            <th scope="row" className = "width_col2">{e.id}</th>
                                                            <td className = "width_col2">{e.type}</td>
                                                            <td className = "width_col2">{this.format_datetime(e.datetime_start)}</td>
                                                            <td className = "width_col2">{e.comentaries}</td>
                                                            <td className = "width_col2">	
                                                                <span className = "btn-link cursor_puntero" onClick = {() => this.ver_details_model(e.id)}> View details</span>
                                                            </td>
                                                            <td className = "width_col2">
                                                                <span className = "btn-link cursor_puntero"  onClick = {() => this.setModalCancelId(true, e.id)}> Cancel training</span>
                                                            </td>
        
                                                        </tr>                                    
                                                    )}
                
                                                </tbody>
                                                </table>
                                            ):(
                                                <div className = "row text-center">
                                                    <div className = "col-sm-2"></div>
                                                    <p className = "col-sm-8 alert alert-primary sin_elementos"  role = "alert"> 
                                                        There are no models being trained at this time.
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
                                    <h4 className="card-title titulo">Completed trainings </h4>
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
        
                                                    <th scope="col">Id </th>
                                                    <th scope="col">Type </th>
                                                    <th scope="col">Training start</th>
                                                    <th scope="col">Training end</th>
                                                    <th scope="col">Additional comments </th>
                                                    <th scope="col"></th>
                                                    <th scope="col"></th>
                                                    <th scope="col"></th>
        
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.state.finished.map((e) => 
                                                        <tr key = {e.id}>
        
                                                            <th scope="row">{e.id}</th>
                                                            <td>{e.type}</td>
                                                            <td>{this.format_datetime(e.datetime_start)}</td>
                                                            <td>{this.format_datetime(e.datetime_end)}</td>
                                                            <td>{e.comentaries}</td>
                                                            <td>
                                                                <span className = "btn-link cursor_puntero" onClick = {() => this.ver_details_model(e.id)}> View details</span>
                                                            </td>
                                                            <td>
                                                            <span className = "btn-link cursor_puntero" onClick = {() => this.save_model(e.id)}> Save model</span>
                                                            </td>
                                                            <td><span className = "btn-link cursor_puntero"  onClick = {() => this.setModalDiscardId(true, e.id)}> Discard model</span></td>
                                                       
        
                                                        </tr>
                                                )}
        
                                            </tbody>
                                            </table>
                                            ):(
                                                <div className = "row text-center">
                                                    <div className = "col-sm-2"></div>
                                                    <p className = "col-sm-8 alert alert-primary sin_elementos" role = "alert"> 
                                                    No models have completed their training yet.
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

export default TasksModels;
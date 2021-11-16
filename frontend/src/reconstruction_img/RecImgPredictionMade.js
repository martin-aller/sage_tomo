import React, { Component } from 'react'
import Header from '../management/Header';
import GoBackButton from '../management/GoBackButton';
import NoSession from '../management/NoSession'
import Loading from '../management/Loading'
import {Redirect} from "react-router-dom";
import axios from 'axios';


class RecImgPredictionMade extends Component{
    //View shown to the user when uploading a voltages file and making a conductivity prediction. 
    //Users are shown the predicted conductivities and they can reconstruct the images of these meshes.

    constructor(props){
        super(props);
        this.state = {
            predictions: null,
            performing_predictions: true,
            url_img: null,
            indexes: new Array(844),
            index_selected: null,
            index_reconstructed_img: null, //It is necessary to avoid that the image number change when selecting another mesh
            error_selection: false,
            aSubirVoltages: false,
            reconstructing_img: false,
            initial_index: 0,
            show_btn_previous: false,
            show_btn_next: true,
            error_model: false,
            help_message: <p>This window displays the predictions made for the set of voltages uploaded to the system. Each of the rows
            of the lower table contains the predicted conductivity values for a given mesh. By selecting one of these meshes and
            clicking on Reconstruct image, the image associated with the predictions will be generated.</p>

          }
    }

    componentDidMount(){
        this.upload_voltages();
    }

    
    modifica_index(value){
        var value_aux = this.state.initial_index + value;
        var index_final_aux = value_aux + 10
        //

        if(this.state.predictions.predicted_conductivities.slice(value_aux, index_final_aux).length === 0){
            
            this.setState({show_btn_next: false})
        }else if(value_aux <= 0){
            
            this.setState({initial_index: 0, show_btn_next: true, show_btn_previous: false})
        }
        else{
            this.setState({initial_index: value_aux, show_btn_next: true, show_btn_previous: true})
        }
    }


    upload_voltages(){
        
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        const formData = new FormData(); 
        formData.append("file", this.props.location.state.file);
        formData.append("model", this.props.location.state.id_model);


        axios.post(this.props.location.state.url_base + "api_tomo/predict_conductivities/", formData,config)
        .then(
            response => {
                
                
                this.setState({predictions: response.data, performing_predictions: false});
            })
        .catch(error => {
            
            console.error('An error has occurred', error);
            if(error.response.status === 404){
                this.setState({error_model: true});
            }else{
                this.setState({aSubirVoltages: true});
            }

        }); 
    }

    round_num(num){
        return Math.round((num + Number.EPSILON) * 100) / 100; //Number.Epsilon for numbers like 1.005
    }


    reconstruct_img(){
        if(this.state.index_selected === null){
            this.setState({error_selection: true});
        }else{
            this.setState({reconstructing_img: true});
            const config = {
                headers: {
                  'Authorization': 'Token ' + this.props.location.state.token
                }
            }

            const par = {
                model : this.props.location.state.id_model,
                conductivities: this.state.predictions.predicted_conductivities[this.state.index_selected],
            }
    
            axios.post(this.props.location.state.url_base + "api_tomo/reconstruct_img_simple/", par, config)
            .then(
                response => {
                    this.setState({url_img: response.data.url_img, 
                                   index_reconstructed_img: this.state.index_selected, 
                                   reconstructing_img: false});
                })
            .catch(error => {
                console.error('An error has occurred', error);
            }); 
        }

    }




    render(){
        
        var message_model = "El model selected ya no se encuentra en el sistema.";

        if (this.state.error_model === true) {
            return <Redirect push to={{
                pathname: '/without_model',
                state: { token: this.props.location.state.token, 
                        url_base: this.props.location.state.url_base,
                        message: message_model}
            }}/>        
        }

        if (this.state.aSubirVoltages === true) {
            
            return <Redirect push to={{
                pathname: '/rec_img_upload_voltages',
                state: { id_model: this.props.location.state.id_model,
                         error_structure: true,
                         token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }


        var index_final = this.state.initial_index + 9;

        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Header with_account = {true} help_message = {this.state.help_message} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <GoBackButton/>
        
        
                        {this.state.performing_predictions === true ? (
                            <Loading
                                completo = {true} 
                                cabecera = "Prediction of conductivities"
                                message = "Uploading file and making predictions. This operation may take a few seconds."
                            />
                        ):(
                            <div>
                                <div className="card bg-light mx-auto mb-3 caja max_width_50">
                                    <div className="card-header"><b>Predictions completed</b></div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-12 width_14" >
                                                <p><b>Number of predictions:</b> {this.state.predictions.predicted_conductivities.length}</p>
                                                <p><b>Model used (ID):</b> {this.props.location.state.id_model}</p>
                                            </div>
        
                                        </div>
                                    </div>
                                </div>
                        
        
                            
                                {this.state.reconstructing_img === true ? (
                                    <div className = "container">
                                        <br/>
                                        <div className="row" id = "load">
                                            <div className = "col text-center">
                                                <div className="spinner-border text-dark loaddor_grande" role="status">
                                                </div>
                                            </div>
                                        </div>
        
                                        <div className="alert alert-primary" role="alert" id = "message_informativo">
                                            Reconstructing image. This operation may take a few seconds.
                                        </div>
                                    </div>
                                ):(
                                    <div>
                                        {this.state.url_img !== null &&
                                            <div className = "container text-center margin_bottom_2">
                                                <div className="row">
                                                    <div className = "col-md-3"></div>
                                                    <div className="card col-md-6 caja width_14">
                                                        <div className = "container">
                                                            <h5 className="card-title text-center margin_top_1">Reconstructed image of mesh {this.state.index_reconstructed_img} </h5>
                                                            <img className="card-img-top border border-dark img_rec text-center" src={"http://" + this.state.url_img} alt="Reconstructed mesh"/>
                                                        </div>
                                                    </div>
                                                    <div className = "col-md-3"></div>
        
                                                </div>
                                            </div>
                                        }
        
                                        <div className="card bg-light mx-auto mb-3 caja max_width_50">
                                            <div className="card-header"><b>Predictions completed</b></div>
                                            <div className="card-body">
                                                <p className="card-text">Select the mesh you want to reconstruct:</p>
                                                <div className="row">
                                                    <div className="col-md-12 width_14">
                                                        <div >
                                                            <div className="row" >
                                                                        <table className = "table table-striped tabla_scroll_x tabla_scroll_y">
                                                                        <thead>
                                                                            <tr>
                                                                                <th scope="col"></th>
                                                                                <th scope="col">Mesh index</th>
                                                                                {Array.from(Array(844), (e, i) => {
                                                                                    return <td key={i}><b>V{i}</b></td>
                                                                                })}
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {this.state.predictions.predicted_conductivities.slice(this.state.initial_index, index_final).map((l_con, index)=>
                                                                                <tr key = {index}>
                                                                                    <td><input type="radio" name="grupo_meshes" value = {this.state.initial_index + index} 
                                                                                        onClick = {() => this.setState({index_selected: (this.state.initial_index + index)})} required/></td>
                                                                                    <th scope="row"> {this.state.initial_index + index} </th>
                                                                                    {l_con.map((con, index)=>
                                                                                        <td key = {index}>{this.round_num(con)}</td>
                                                                                    )}
        
                                                                                </tr>
                                                                            )}
                
                                                                        </tbody>
                                                                        </table>
        
        
        
                                                            </div>
                                                            <div className="form-group row ">
                                                                        
                                                                        <div className = "col-md-6">
                                                                            {this.state.show_btn_previous === true &&
                                                                                <input type="button"  className="btn-sm btn-dark  mb-2" 
                                                                                    onClick= {() => this.modifica_index(-10)} id = "btn_anterior" value = "Previous"/> 
                                                                            }
                                                                        </div>
                                                                        
                                                                        
                                                                        <div className = "col-md-6">
                                                                            {this.state.show_btn_next === true &&
                                                                                <input type="button"  className="btn-sm btn-dark  mb-2 float-right" 
                                                                                    onClick= {() => this.modifica_index(10)} id = "btn_siguiente" value = "Next"/>
                                                                            } 
                                                                        </div>
                                                            </div>
                                                            {this.state.error_selection === true &&
                                                                <div className = "row text-center margin_top_2">
                                                                    <div className = "col-md-2"></div>
                                                                    <div className="col-md-8">
                                                                        <div className="alert alert-danger">
                                                                            <p>No has selected ninguna mesh.</p>
                                                                        </div>                                
                                                                    </div>
                                                                    <div className = "col-md-2"></div>
                                                                </div>
                                                            }
                                                            <div className="row text-center">
                                                                <div className = "col-md-12">
                                                                    <button type="submit"  className="btn-lg btn-dark  mb-2" onClick={() => this.reconstruct_img()} id = "btn_reconstruct" > 
                                                                        Reconstruct image
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
        
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
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

export default RecImgPredictionMade;
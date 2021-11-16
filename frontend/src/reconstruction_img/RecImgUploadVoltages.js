import React, { Component } from 'react'
import Header from '../management/Header';
import GoBackButton from '../management/GoBackButton';
import NoSession from '../management/NoSession'
import {Redirect} from "react-router-dom";


class RecImgUploadVoltages extends Component{
    //View with a form for the user to upload a file with voltages from which to make conductivity predictions.
    
    constructor(props){
        super(props);
        this.state = {
            toPredictionMade: false,
            error_structure: false,
            error_selection: false,
            file: null,
            help_message: <p>In this window you can upload a file in CSV format containing a set of voltages. In each line, it 
                must include the voltages associated with a mesh, separated by semicolons. In case of incorrect formatting, an 
                error will be displayed. </p>

        }
        this.handleChangeFile = this.handleChangeFile.bind(this);

    }

    componentDidMount(){
        this.setState({error_structure: this.props.location.state.error_structure})
    }

    handleChangeFile(e){
        
        this.setState({file: e.target.files[0]});
    }

    access_prediction_performed(){
        this.setState({error_selection: false, error_structure:false});
        if(this.state.file === null){
            this.setState({error_selection: true});
        }else{
            this.setState({toPredictionMade: true});
        }
    }



    render(){
        
        if (this.state.toPredictionMade === true) {
            return <Redirect push to={{
                pathname: "/rec_img_prediction_performed",
                state: { file: this.state.file, id_model: this.props.location.state.id_model, token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>
        }

        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Header with_account = {true} help_message = {this.state.help_message} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <GoBackButton/>
                        <div className = "container">
                            <div className="card caja">
                                <div className="card-body" >
                                    <h5 className="card-title"><b>Upload file of voltages</b></h5>
                                    <div className = "row"  >
                                        <div className="col-md-12">
                                                <div className="form-group row">
                                                    <label className="col-sm-6 col-form-label"> Select the dataset you want to upload: </label>
                                                    <div className="col-sm-3">
                                                        <input type="file" className="form-control-file selected" onChange={this.handleChangeFile} /> 
                                                    </div>
                                                    <div className="col-sm-3">
                                                        <p id = "label_selected" hidden> Selected file: </p>
                                                        <p id= "file_selected"></p>
                                                    </div>
        
                                                </div>
        
                                                {this.state.error_structure === true &&
                                                    <div className="alert alert-danger" role="alert" id = "structure_incorrecta">
                                                        The format or structure of the selected file is incorrect.
                                                    </div>
                                                }
                                                {this.state.error_selection === true &&
                                                    <div className="alert alert-danger row" role="alert" id = "message_informativo" >
                                                        You have not selected a file.
                                                    </div>
                                                }
        
                                
                                            <hr/>
                                            <br/>
                                            <br/>
        
        
                                            <div className="form-group row text-center">
                                                <div className = "col-md-12">
                                                    <input type="button"  className="btn-lg btn-dark  mb-2" onClick={() => this.access_prediction_performed()} id = "btn_predict" value = "Make predictions"/> 
                                                        
                                                </div>
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

export default RecImgUploadVoltages;
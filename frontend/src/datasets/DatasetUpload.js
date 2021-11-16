import React, { Component } from 'react'
import Header from '../management/Header';
import GoBackButton from '../management/GoBackButton';
import Loading from '../management/Loading'
import axios from 'axios';
import NoSession from '../management/NoSession'
import {Redirect} from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';



class DatasetUpload extends Component{
    //View with the form to upload a dataset to the system.
    
    constructor(props){
        super(props);
        this.state = {
            //aImagenes: false,
            toTasks: false,
            file: null,
            error_structure: false,
            error_selection: false,
            load: false,
            help_message: <p>In this window you can upload and add a dataset to the system. The dataset you upload must be in 
                            CSV format, so that each line contains the voltage values, the conductivity values and the number of 
                            artifacts from each mesh, all separated by a semicolon. In case the file you select is not in CSV 
                            format or has an incorrect structure, an error message will be displayed.</p>,
            
        }

        this.handleChangeFile = this.handleChangeFile.bind(this);

    }


    handleChangeFile(e){
        this.setState({file: e.target.files[0]});
    }



    upload_dataset(values){
        this.setState({error_selection: false, load: true});

        if(this.state.file === null){
            this.setState({error_selection: true, load: false});
        }else{
            
            const config = {
                headers: {
                  'Authorization': 'Token ' + this.props.location.state.token
                }
            }
    
            const formData = new FormData(); 
         
            // Update the formData object 
            formData.append("file", this.state.file);
            formData.append("min_radius", values.min_radius);
            formData.append("max_radius", values.max_radius);
            formData.append("visible", values.visible);
            formData.append("seed", values.seed);
    
    
            axios.post(this.props.location.state.url_base + "api_tomo/upload_dataset/", formData,config)
            .then(
                response => {
                    
                    this.setState({toTasks: true});
                    
                })
            .catch(error => {
                console.error('An error has occurred', error);
                this.setState({error_structure:true, load: false});
            }); 
        }

    }





    render(){

        if (this.state.toTasks === true) {
            return <Redirect push to={{
                pathname: '/tasks_datasets',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Header with_account = {true} help_message = {this.state.help_message} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <GoBackButton/>
        
                        {this.state.load === true ? (
                            <Loading
                                completo = {false} 
                            />
                        ):(
                            <div className="container">
                                <div className="card caja">
                                    <div className="card-body" >
                                        <h5 className="card-title"><b>Upload dataset</b></h5>
        
        
                                        <Formik
                                            initialValues={{ min_radius: 4, max_radius: 10, visible : 'True', seed: 12345678}}
                                            validationSchema={Yup.object({
            
                                            min_radius: Yup.number()
                                                .positive("It must be a positive number.")
                                                .integer("It must be an integer.")
                                                .min(1, 'The minimum radius must belong to the interval [1,9].')
                                                .max(9, 'The minimum radius must belong to the interval [1,9].')
                                                .required('Required field.'),
                                            max_radius: Yup.number()
                                                .positive("It must be a positive number.")
                                                .integer("It must be an integer.")
                                                .min(2, 'The maximus radius must belong to the interval [2,10].')
                                                .max(10, 'The maximus radius must belong to the interval [2,10].')
                                                .required('Required field.'),
                                            seed: Yup.number()
                                                .positive("It must be a positive number.")
                                                .integer("It must be an integer.")
                                                .min(1, 'The seed must belong to the interval [1,99999999].')
                                                .max(99999999, 'The seed must belong to the interval [1,99999999].')
                                                .required('Required field.')
                                            })}
                                            onSubmit={(values, { setSubmitting }) => {
                                            setTimeout(() => {
                                                
                                                this.upload_dataset(values);
                                                setSubmitting(false);
                                            });
                                            }}>
                                            <Form className = "row">
                                                <div className="col-md-12">
        
                                                    <div className="form-group row">
                                                        <label htmlFor="min_radius" className="col-sm-6 col-form-label"> Minimum radius:</label>
                                                        <div className="col-sm-6">
                                                            <Field className="form-control width_10" name="min_radius" type="number" />
                                                            <span className = "error1"><ErrorMessage  name="min_radius" /> </span>
                                                        </div>
                                                    </div>
                                                    <hr/>
        
        
                                                    <div className="form-group row">
                                                        <label htmlFor="max_radius" className="col-sm-6 col-form-label"> Maximum radius:</label>
                                                        <div className="col-sm-6">
                                                            <Field className="form-control width_10" name="max_radius" type="number" />
                                                            <span className = "error1"><ErrorMessage  name="max_radius" /> </span>
                                                        </div>
                                                    </div>
                                                    <hr/>
        
        
                                                    <div className="form-group row">
                                                        <label htmlFor="visible" className="col-sm-6 col-form-label"> Visible:</label>
                                                        <div className="col-sm-6">
                                                            <Field className="form-control width_10" as = "select" name="visible">
                                                                <option value="True">Yes</option>
                                                                <option value="False">No</option>
                                                            </Field>
                                                            <span className = "error1"><ErrorMessage  name="visible" /> </span>
                                                        </div>
                                                    </div>
                                                    <hr/>
                                                    
                                                    <div className="form-group row">
                                                        <label htmlFor="seed" className="col-sm-6 col-form-label"> Seed:</label>
                                                        <div className="col-sm-6">
                                                            <Field className="form-control width_10" name="seed" type="number" />
                                                            <span className = "error1"><ErrorMessage  name="seed" /> </span>
                                                        </div>
                                                    </div>
                                                    <hr/>
        
                                                    <div className="form-group row">
        
                                                        <label className="col-sm-6 col-form-label"> Select the dataset you want to upload: </label>
        
                                                        <div className="col-sm-3">
                                                        <input type="file" className="form-control-file selected" onChange={this.handleChangeFile}/> 
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
        
                                                    <br/>
                                                    <br/>
        
        
                                                    <div className = "row">
                                                        <div className="col-md-12 text-center my-auto width_14" >
                                                            <button className="btn-lg btn-dark mb-2" type="submit"> Upload dataset</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Form>
                                        </Formik>
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

export default DatasetUpload;
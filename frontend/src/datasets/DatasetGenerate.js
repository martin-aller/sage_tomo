import React, { Component } from 'react'
import Header from '../management/Header';
import GoBackButton from '../management/GoBackButton';
import NoSession from '../management/NoSession'
import axios from 'axios';
import {Redirect} from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';



class DatasetGenerate extends Component{
    //View with the form to generate a new dataset.
    
    constructor(props){
        super(props);
        this.state = {
            //aImagenes: false,
            toTasks: false,
            help_message: <div>In this window you can define the features of the dataset you want to generate, 
                among which are the number of meshes with one, two and three artifacts and the minimum 
                and maximum radius of the artifacts.   The position and shape of the artifacts are defined pseudo-randomly. 
                The size of the artifacts is also defined pseudo-randomly, by setting for each artifact a radius size that 
                belongs to the interval you specify. For example, if you select 4 as the minimum radius and 10 as the maximum radius, 
                the artifacts contained in all meshes will have radii belonging to the interval [4,10].

            </div>
          }

    }


    generate_dataset(values){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        const par = {
            n1: values.n_meshes_1,
            n2: values.n_meshes_2,
            n3: values.n_meshes_3,
            min_radius: values.min_radius,
            max_radius: values.max_radius,
            visible: values.visible,
            seed: values.seed,

        }

        axios.post(this.props.location.state.url_base + "api_tomo/generate_dataset/", par, config)
        .then(
            response => {
                
                this.setState({toTasks: true});
                
            })
        .catch(error => {
            console.error('An error has occurred', error);
        }); 
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
        
                        <div className="container">
                            <div className="card caja">
                                <div className="card-body" >
                                    <h5 className="card-title"><b>Generate dataset</b></h5>
        
        
                                    <Formik
                                        initialValues={{ n_meshes_1: 50, n_meshes_2: 30, n_meshes_3: 20, min_radius: 4, max_radius: 10, visible : 'True', seed: 12345678}}
                                        validationSchema={Yup.object({
                                        n_meshes_1: Yup.number()
                                            .positive("It must be a positive number.")
                                            .integer("It must be an integer.")
                                            .min(12, 'The minimum number of meshes with an artifact is 12.')
                                            .max(5600, 'No more than 5600 meshes with one artifact can be generated.')
                                            .required('Required field.'),
                                        n_meshes_2: Yup.number()
                                            .positive("It must be a positive number.")
                                            .integer("It must be an integer.")
                                            .min(12, 'The minimum number of meshes with two artifacts is 12.')
                                            .max(2800, 'No more than 2800 meshes with two artifacts can be generated.')
                                            .required('Required field.'),
                                        n_meshes_3: Yup.number()
                                            .positive("It must be a positive number.")
                                            .integer("It must be an integer.")
                                            .min(12, 'The minimum number of meshes with three artifacts is 12.')
                                            .max(1820, 'No more than 1820 meshes with three artifacts can be generated.')
                                            .required('Required field.'),
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
                                            

                                            this.generate_dataset(values);
                                            setSubmitting(false);
                                        });
                                        }}>
                                        <Form className = "row">
                                            <div className="col-md-12">
                                                <div className="form-group row">
                                                    <label htmlFor="n_meshes_1" className="col-sm-6 col-form-label"> Number of meshes with one artifact:</label>
                                                    <div className="col-sm-6">
                                                        <Field className="form-control width_10" name="n_meshes_1" type="number" />
                                                        <span className = "error1"><ErrorMessage  name="n_meshes_1" /> </span>
                                                    </div>
                                                </div>
                                                <hr/>
        
        
                                                <div className="form-group row">
                                                    <label htmlFor="n_meshes_2" className="col-sm-6 col-form-label"> Number of meshes with two artifacts:</label>
                                                    <div className="col-sm-6">
                                                        <Field className="form-control width_10" name="n_meshes_2" type="number" />
                                                        <span className = "error1"><ErrorMessage  name="n_meshes_2" /> </span>
                                                    </div>
                                                </div>
                                                <hr/>
        
        
                                                <div className="form-group row">
                                                    <label htmlFor="n_meshes_3" className="col-sm-6 col-form-label"> Number of meshes with three artifacts:</label>
                                                    <div className="col-sm-6">
                                                        <Field className="form-control width_10" name="n_meshes_3" type="number" />
                                                        <span className = "error1"><ErrorMessage  name="n_meshes_3" /> </span>
                                                    </div>
                                                </div>
                                                <hr/>
        
        
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
        
                                                <br/>
                                                <br/>
        
        
                                                <div className = "row">
                                                    <div className="col-md-12 text-center my-auto width_14" >
                                                        <button className="btn-lg btn-dark mb-2" type="submit"> Generate dataset</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Form>
                                    </Formik>
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

export default DatasetGenerate;
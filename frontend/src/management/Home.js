import React, { Component } from 'react'
import Header from './Header';
import NoSession from './NoSession'
import {Redirect} from "react-router-dom";


class  Home extends Component{
    //Main menu of the application.
    
    constructor(props){
        super(props);
        this.state = {
            toRecImg: false,
            toModels: false,
            toDatasets: false,
            toTasks: false,
            help_message: <p>From the main window, you can access every one of the four main blocks of the application. On the 
                other hand, you can access your account information in the upper right corner of this and the other windows. </p>,
          }

    }

    access_rec_img(){
        this.setState({ toRecImg: true});
    }

    access_datasets(){
        this.setState({ toDatasets: true});
    }

    access_models(){
        this.setState({ toModels: true});
    }

    access_tasks(){
        this.setState({ toTasks: true});
    }



    render(){

        if (this.state.toRecImg === true) {
            return <Redirect push to={{
                pathname: '/models_rec_img',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        if (this.state.toModels === true) {
            return <Redirect push to={{
                pathname: '/models',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }


        if (this.state.toDatasets === true) {
            return <Redirect push to={{
                pathname: '/datasets',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }



        if (this.state.toTasks === true) {
            return <Redirect push to={{
                pathname: '/tasks',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                    <Header con_cuenta = {true} principal = {true} help_message = {this.state.help_message} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <div className ="container principal_container" >
                            <div className ="row margin_bottom_5">
                                <div className ="card col-md-3 caja padding_top_1">
                                <img  className  = "card-img-top rounded" src={process.env.PUBLIC_URL + '/images/mesh_prin.png'} width = "90%" height = "55%" alt = "rec_img"/>
                                <div className ="card-body d-flex flex-column text-center">
                                    <h5 className ="card-title"> <b>Reconstruction of images</b></h5>
                                    <p className ="card-text">Reconstruct and analyze images of bodies.</p>
                                    <span className  ="text-center  mt-auto"><button className ="btn btn-dark" onClick = {() => this.access_rec_img()}>Access</button></span>
                                </div>
                                </div>


                                <div className ="card col-md-3 caja padding_top_1">
                                <img  className  = "card-img-top rounded" src={process.env.PUBLIC_URL + '/images/neuronas.jpg'} width = "90%" height = "55%" alt = "models"/>

                                <div className ="card-body d-flex flex-column text-center">
                                    <h5 className ="card-title"><b>Models</b></h5>
                                    <p className ="card-text">Analyze and compare your models and the public models.</p>
                                    <span className  ="  mt-auto"><button  className ="btn btn-dark" onClick = {() => this.access_models()}>Access</button></span>
                                </div>
                                </div>
                                
                        
                                <div className ="card col-md-3 caja padding_top_1">
                                <img  className  = "card-img-top rounded back_black" src={process.env.PUBLIC_URL + '/images/dataset.png'} width = "90%" height = "55%" alt = "datasets"/>

                                <div className ="card-body d-flex flex-column text-center">
                                    <h5 className ="card-title"><b>Datasets</b></h5>
                                    <p className ="card-text">Take a look at the models stored in the system.</p>
                                    <span className  =" mt-auto"><button className ="btn btn-dark" onClick = {() => this.access_datasets()}>Access</button></span>
                                </div>
                                </div>
                                

                                <div className ="card col-md-3 caja padding_top_1">
                                <img  className  = "card-img-top rounded" src={process.env.PUBLIC_URL + '/images/tasks.png'} width = "90%" height = "55%" alt = "tasks"/>


                                <div className ="card-body d-flex flex-column text-center">
                                    <h5 className ="card-title"><b>Tasks</b></h5>
                                    <p className ="card-text">Check the state of your tasks.</p>
                                    <span className  ="text-center  mt-auto"><button className ="btn btn-dark" onClick = {() => this.access_tasks()}>Access</button></span>
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

export default Home;
import React, { Component } from 'react'
import Cabecera from '../gestion/Cabecera';
import BotonAtras from '../gestion/BotonAtras';
import SinSesion from '../gestion/SinSesion'
import {Redirect} from "react-router-dom";

class ModelosTipos extends Component{
    //Vista de los diferentes tipos de modelos que existen en el sistema.
    //A esta vista se accede cuando se va a entrenar a un nuevo modelo.
    
    constructor(props){
        super(props);
        this.state = {
            aDNN: false,
            aRF: false,
            aSVM: false,
            mensaje_ayuda: <p>The system allows training three different types of models: neural networks (DNN), random forest (RF) and support vector machines (SVM). Select one of the types and you will be able 
                            to define the specific parameters to train a model of the chosen type.</p>

          }
    }


    render(){
        console.log("Se ejecuta Modelos Tipos")
        if (this.state.aDNN === true) {
            return <Redirect push to={{
                pathname: '/entrenar_dnn',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>
        }

        if (this.state.aRF === true) {
            return <Redirect push to={{
                pathname: '/entrenar_rf',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>
        }

        if (this.state.aSVM === true) {
            return <Redirect push to={{
                pathname: '/entrenar_svm',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>
        }

        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Cabecera con_cuenta = {true} mensaje_ayuda = {this.state.mensaje_ayuda} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <BotonAtras/>
        
                        <h5 className = "text-center" > Select the type of model you want to train : </h5>
                        <br/>
                        <div className="container" >
                            <div className="row" >
                                <div className="card col-md-4 caja padding_top_1">
                                    <div className="card-body d-flex flex-column text-center ">
                                        <h5 className="card-title"> <b>Neural Network</b> </h5>
                                        <img  className = "rounded mx-auto d-block margin_bottom_1" src={process.env.PUBLIC_URL + '/imagenes/dnn.png'}/>
                                        <span className ="mt-auto"><span className="btn btn-dark" onClick = {() => this.setState({aDNN: true})}>Access</span></span>
                                    </div>
                                </div>
        
                                <div className="card col-md-4 caja padding_top_1">
                                    <div className="card-body d-flex flex-column text-center ">
                                        <h5 className="card-title"> <b>Random Forest</b> </h5>
                                        <img  className = "rounded mx-auto d-block margin_bottom_1" src={process.env.PUBLIC_URL + '/imagenes/rf.png'}
                                        width = "65%" height = "65%" />
                                        <span className ="mt-auto"><span className="btn btn-dark" onClick = {() => this.setState({aRF: true})} >Access</span></span>
                                    </div>
                                </div>
        
                                <div className="card col-md-4 caja padding_top_1">
                                    <div className="card-body d-flex flex-column text-center">
                                        <h5 className="card-title"> <b>Support Vector Machine </b></h5>
                                        <img  className = "rounded mx-auto d-block margin_bottom_1" src={process.env.PUBLIC_URL + '/imagenes/svm.png'} 
                                        width = "80%" height = "80%" />
                                        <span className ="mt-auto"><a className="btn btn-dark" onClick = {() => this.setState({aSVM: true})} >Access</a></span>
                                    </div>
                                </div>
        
                            </div>
                        </div>
                    </div>
                ):(
                    <SinSesion/>
                )}

            </div>
        );
    }
}

export default ModelosTipos;
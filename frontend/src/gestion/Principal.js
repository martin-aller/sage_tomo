import React, { Component } from 'react'
import Cabecera from './Cabecera';
import SinSesion from './SinSesion'
import {Redirect} from "react-router-dom";


class  Principal extends Component{
    //Menú principal de la aplicación.
    
    constructor(props){
        super(props);
        this.state = {
            //aImagenes: false,
            aRecImg: false,
            aModelos: false,
            aDatasets: false,
            aTareas: false,
            mensaje_ayuda: <p>Desde la ventana principal puedes acceder a los cuatro grandes bloques de los que dispone la aplicación.
                           Por otro lado, en la esquina superior izquierda de ésta y de las demás ventanas, podrás acceder a la información
                           sobre tu cuenta.</p>,
          }

    }

    acceder_rec_img(){
        console.log("Llega a la función");
        this.setState({ aRecImg: true});
    }

    acceder_datasets(){
        console.log("Llega a la función");
        this.setState({ aDatasets: true});
    }
    acceder_modelos(){
        console.log("Llega a la función");
        this.setState({ aModelos: true});
    }

    acceder_tareas(){
        console.log("Llega a la función");
        this.setState({ aTareas: true});
    }



    render(){
        console.log("Se ejecuta PRINCIPAL: ", this.props.location.state.url_base);




        if (this.state.aRecImg === true) {
            return <Redirect push to={{
                pathname: '/modelos_rec_img',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        if (this.state.aModelos === true) {
            return <Redirect push to={{
                pathname: '/modelos',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }


        if (this.state.aDatasets === true) {
            return <Redirect push to={{
                pathname: '/datasets',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }



        if (this.state.aTareas === true) {
            return <Redirect push to={{
                pathname: '/tareas',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                    <Cabecera con_cuenta = {true} principal = {true} mensaje_ayuda = {this.state.mensaje_ayuda} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <div className ="container principal_contenedor" >
                            <div className ="row margin_bottom_5">
                                <div className ="card col-md-3 caja padding_top_1">
                                <img  className  = "card-img-top rounded" src={process.env.PUBLIC_URL + '/imagenes/malla_prin.png'} width = "90%" height = "55%" alt = "rec_img"/>
                                <div className ="card-body d-flex flex-column text-center">
                                    <h5 className ="card-title">Reconstruction of images</h5>
                                    <p className ="card-text">Reconstruct and analyze images of bodies.</p>
                                    <span className  ="text-center  mt-auto"><button className ="btn btn-dark" onClick = {() => this.acceder_rec_img()}>Access</button></span>
                                </div>
                                </div>


                                <div className ="card col-md-3 caja padding_top_1">
                                <img  className  = "card-img-top rounded" src={process.env.PUBLIC_URL + '/imagenes/neuronas.jpg'} width = "90%" height = "55%" alt = "modelos"/>

                                <div className ="card-body d-flex flex-column text-center">
                                    <h5 className ="card-title">Models</h5>
                                    <p className ="card-text">Analyze and compare your models and the public models.</p>
                                    <span className  ="  mt-auto"><button  className ="btn btn-dark" onClick = {() => this.acceder_modelos()}>Access</button></span>
                                </div>
                                </div>
                                
                        
                                <div className ="card col-md-3 caja padding_top_1">
                                <img  className  = "card-img-top rounded back_black" src={process.env.PUBLIC_URL + '/imagenes/dataset.png'} width = "90%" height = "55%" alt = "datasets"/>

                                <div className ="card-body d-flex flex-column text-center">
                                    <h5 className ="card-title">Datasets</h5>
                                    <p className ="card-text">Take a look at the models stored in the system.</p>
                                    <span className  =" mt-auto"><button className ="btn btn-dark" onClick = {() => this.acceder_datasets()}>Access</button></span>
                                </div>
                                </div>
                                

                                <div className ="card col-md-3 caja padding_top_1">
                                <img  className  = "card-img-top rounded" src={process.env.PUBLIC_URL + '/imagenes/tareas.png'} width = "90%" height = "55%" alt = "tareas"/>


                                <div className ="card-body d-flex flex-column text-center">
                                    <h5 className ="card-title">Tasks</h5>
                                    <p className ="card-text">Check the state of your tasks.</p>
                                    <span className  ="text-center  mt-auto"><button className ="btn btn-dark" onClick = {() => this.acceder_tareas()}>Access</button></span>
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

export default Principal;
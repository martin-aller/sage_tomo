import React, { Component } from 'react'
import Cabecera from './Cabecera'
import {Redirect} from "react-router-dom";


class SinSesion extends Component{
    //Vista que se muestra si el usuario intenta acceder a una vista  desde el navegador
    //sin haber iniciado sesión.
    
    constructor(props){
        super(props);
        this.state = {
            aInicio: false,


          }
    }

    render(){
        if (this.state.aInicio === true) {
            return <Redirect push to="/" />
        }

        return(
            <div>
                <Cabecera/>
                <div className="card caja mx-auto mb-3 max_width_50" >
                    <div className="card-header">You are not logged in</div>
                    <div className="card-body">
                        <h5 className="card-title">You must be logged in to access the application.</h5>
                        <input type="button" className="btn btn-dark mb-2 float-right" value = "Go to login" onClick = {() => this.setState({aInicio:true})}/> 
                    </div>
                </div>            
            </div>
        );
    }
}

export default SinSesion;
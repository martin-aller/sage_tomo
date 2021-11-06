import React, { Component } from 'react'
import Cabecera from './Cabecera'
import {Redirect} from "react-router-dom";


class SinModelo extends Component{
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
            return <Redirect push to={{
                pathname: '/principal',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        return(
            <div>
                <Cabecera/>
                <div className="card caja mx-auto mb-3 max_width_50" >
                    <div className="card-header">Modelo eliminado</div>
                    <div className="card-body">
                        <h5 className="card-title">{this.props.location.state.mensaje}</h5>
                        <input type="button" className="btn btn-dark mb-2 float-right" value = "Volver al menú principal" onClick = {() => this.setState({aInicio:true})}/> 
                    </div>
                </div>            
            </div>
        );
    }
}

export default SinModelo;
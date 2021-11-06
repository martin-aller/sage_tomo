import React, { Component } from 'react'
import Cabecera from './Cabecera';
import SinSesion from './SinSesion'
import {Redirect} from "react-router-dom";


class ExitoRegistro extends Component{
    //Vista que se muestra al usuario cuando se ha registrado con éxito.
    
    constructor(props){
        super(props);
        this.state = {
            aPrincipal : false,
            mensaje_ayuda: <p>Ahora que dispones de una cuenta ya puedes hacer uso del sistema TomoSage. En todas las ventanas del
            sistema dispondrás de un botón de Ayuda, mediante el que podrás obtener la ayuda relevante para la ventana en la que te encuentres.</p>
          }

    }

    ir_a_principal(){
        this.setState({ aPrincipal: true});

    }


    render(){
        console.log("Se ejecuta ExitoRegistro");

        if (this.state.aPrincipal === true) {
            return <Redirect push to={{
                pathname: '/principal',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Cabecera con_cuenta = {true} mensaje_ayuda = {this.state.mensaje_ayuda} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <div className="card caja mx-auto mb-3 max_width_50" >
                            <div className="card-header">Registro realizado</div>
                            <div className="card-body">
                                <h5 className="card-title">Te has registrado con éxito.</h5>
                                <input type="button" className="btn btn-dark mb-2 float-right" value = "Ir al menú principal" onClick = {() => {this.ir_a_principal()}}/> 
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

export default ExitoRegistro;
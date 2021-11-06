import React, { Component } from 'react'
import { withRouter } from 'react-router'

class BotonAtras extends Component{
    //Botón para regresar a la vista anterior
    //Este componente se utiliza en la mayor parte de las vistas.

    goBack(){
        console.log(" SE EJECUTA ATRÁS.");
        this.props.history.goBack();

    }

    render(){
        return(
            <div>
                <p className = "btn btn-dark btn-sm fixed-top btn_atras"  onClick = {() => this.goBack()} > 
                    <img className="img-responsive img_btn_atras" src={process.env.PUBLIC_URL + '/imagenes/left-arrow.png'}  width = "20rem"/> Back
                </p>
                {this.props.sin_espaciado === true ? (
                    <span>{console.log("SIN ESPACIO.")}</span>
                ):(
                    <div>
                        <br/>
                        <br/>
                    </div>
                )}

            </div>
        );
    }
}



//const BotonAtrasConRouter = withRouter(BotonAtras);
export default withRouter(BotonAtras);
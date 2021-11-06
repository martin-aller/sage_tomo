import React, { Component } from 'react'



class Cargar extends Component{
    //Símbolo de carga.
    
    render(){


        return(
            <div className = "container">
                {this.props.completo === true ? (
                    <div className = "card caja">
                        <div className="card-header">
                            <h6>{this.props.cabecera}</h6>
                        </div>
                        <div className = "card-body">
                            <br/>
                            
                            <h5>{this.props.mensaje}</h5>   
                        
                            <div className="row" id = "cargar">
                                <div className = "col text-center">
                                    <div className="spinner-border text-dark cargador_grande" role="status">
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                ): (
                    <div className="row" id = "cargar">
                        <div className = "col text-center">
                            <div className="spinner-border text-dark cargador_grande" role="status">
                            </div>
                        </div>
                    </div>
                )}

            </div>
        );
    }
}

export default Cargar;
import React, { Component } from 'react'



class Loading extends Component{
    //Load symbol.
    
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
                            
                            <h5>{this.props.message}</h5>   
                        
                            <div className="row" id = "load">
                                <div className = "col text-center">
                                    <div className="spinner-border text-dark loaddor_grande" role="status">
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                ): (
                    <div className="row" id = "load">
                        <div className = "col text-center">
                            <div className="spinner-border text-dark loaddor_grande" role="status">
                            </div>
                        </div>
                    </div>
                )}

            </div>
        );
    }
}

export default Loading;
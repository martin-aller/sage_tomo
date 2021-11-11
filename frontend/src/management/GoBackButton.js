import React, { Component } from 'react'
import { withRouter } from 'react-router'

class GoBackButton extends Component{
    //Button to return to the previous view
    //This component is used in most of the views.

    goBack(){
        this.props.history.goBack();
    }

    render(){
        return(
            <div>
                <p className = "btn btn-dark btn-sm fixed-top btn_atras"  onClick = {() => this.goBack()} > 
                    <img className="img-responsive img_btn_atras" src={process.env.PUBLIC_URL + '/images/left-arrow.png'}  width = "20rem"
                    alt = "go_back_button"/> Back
                </p>
                {this.props.sin_espaciado === true ? (
                    <span>{}</span>
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


export default withRouter(GoBackButton);
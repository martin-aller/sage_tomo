import React, { Component } from 'react'
import Header from './Header'
import {Redirect} from "react-router-dom";


class NoSession extends Component{
    //View that is displayed if the user tries to access a view from a browser without being logged in.
    
    constructor(props){
        super(props);
        this.state = {
            toLogIn: false,
          }
    }

    render(){
        if (this.state.toLogIn === true) {
            return <Redirect push to="/" />
        }

        return(
            <div>
                <Header/>
                <div className="card caja mx-auto mb-3 max_width_50" >
                    <div className="card-header">You are not logged in</div>
                    <div className="card-body">
                        <h5 className="card-title">You must be logged in to access the application.</h5>
                        <input type="button" className="btn btn-dark mb-2 float-right" value = "Go to login" onClick = {() => this.setState({toLogIn:true})}/> 
                    </div>
                </div>            
            </div>
        );
    }
}

export default NoSession;
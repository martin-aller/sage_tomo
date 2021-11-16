import React, { Component } from 'react'
import Header from './Header'
import {Redirect} from "react-router-dom";


class NoModel extends Component{
    //View that is displayed if the user tries use a just removed model.
    
    constructor(props){
        super(props);
        this.state = {
            toHome: false,


          }
    }

    render(){
        if (this.state.toHome === true) {
            return <Redirect push to={{
                pathname: '/home',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        return(
            <div>
                <Header/>
                <div className="card caja mx-auto mb-3 max_width_50" >
                    <div className="card-header">Model removed</div>
                    <div className="card-body">
                        <h5 className="card-title">{this.props.location.state.message}</h5>
                        <input type="button" className="btn btn-dark mb-2 float-right" value = "Go back to Home" onClick = {() => this.setState({toHome:true})}/> 
                    </div>
                </div>            
            </div>
        );
    }
}

export default NoModel;
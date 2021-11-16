import React, { Component } from 'react'
import Header from './Header';
import NoSession from './NoSession'
import {Redirect} from "react-router-dom";


class SuccessSignUp extends Component{
    //View that is displayed to the users when they have successfully registered.
    
    constructor(props){
        super(props);
        this.state = {
            toHome : false,
            help_message: <p>Now that you have an account, you can use the SageTomo system. You will find a Help button like this 
                one in every window of the system, where you will be able to get the relevant information for the window you are in.</p>
          }

    }

    go_to_home(){
        this.setState({ toHome: true});
    }


    render(){
        
        if (this.state.toHome === true) {
            return <Redirect push to={{
                pathname: '/home',
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        console.log("LLEGA A RENDER")
        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Header with_account = {true} help_message = {this.state.help_message} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <div className="card caja mx-auto mb-3 max_width_50" >
                            <div className="card-header">Registration completed</div>
                            <div className="card-body">
                                <h5 className="card-title">You have successfully signed up.</h5>
                                <input type="button" className="btn btn-dark mb-2 float-right" value = "Go to Home" onClick = {() => {this.go_to_home()}}/> 
                            </div>
                        </div>
                    </div>
                ):(
                    <NoSession/>
                )}
                
            </div>
        );
    }
}

export default SuccessSignUp;
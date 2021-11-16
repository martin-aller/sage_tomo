import React, { Component } from 'react'
import {Redirect} from "react-router-dom";
import axios from 'axios';
import ModalHelp from './ModalHelp';

class Header extends Component{
    //Header for all logged-in views of the system.

    constructor(props){
        super(props);
        this.state = {
            toAccount: false,
            toLogIn: false,
            toHome: false,
            firstname: "",
            lastname: "",
            email: "",
            showModalHelp: false,
          }
    }



    abre_menu(){
        document.getElementById("dropdown-menu").classList.toggle("show");
    }
 

    access_home(){
        this.setState({toHome: true});
    }


    access_account(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.token,
            }
        }
        
        axios.get(this.props.url_base + "api_tomo/dj-rest-auth/user/", config)
            .then(
                response => {
                    
                    this.setState({ toAccount: true, 
                                    firstname : response.data.first_name,
                                    lastname: response.data.last_name,
                                    email: response.data.email});
                })
            .catch(error => {
                console.error('An error has occurred', error);
            });
        
    }


    close_session(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.token,
            }
        }
        axios.post(this.props.url_base + "api_tomo/dj-rest-auth/logout/", config)
            .then(
                response => {
                    this.setState({ toLogIn: true});
                })
            .catch(error => {
                console.error('An error has occurred', error);
            });
        
    }

    setModalHelp(state){
        this.setState({showModalHelp: state});
    }

    render(){
        if (this.state.toAccount === true) {
            return <Redirect push to={{
                pathname: '/account',
                state: { firstname: this.state.firstname,
                         lastname: this.state.lastname,
                         email: this.state.email,
                         token: this.props.token,
                         url_base: this.props.url_base}
            }}/>
        }


        if (this.state.toLogIn === true) {
            return <Redirect push to={{
                pathname: '/',
                state: { token: this.props.token, url_base: this.props.url_base}
            }}/>        
        }


        if (this.state.toHome === true) {
            return <Redirect push to={{
                pathname: '/home',
                state: { token: this.props.token, url_base: this.props.url_base}
            }}/>        
        }



        const with_account = this.props.with_account;
        const principal = this.props.principal;
        return(
            <div>
                
                {with_account === true ?( //HEADER WITH ACCOUNT
                    <div >
                        <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top border border-secondary cabecera_with_account">
                            <div className="navbar-collapse collapse w-100 order-1 order-md-0 dual-collapse2 " >
                                <div className="navbar-nav mr-auto" >
                                    <div className="nav-item">
                                        <span><img  className="img-responsive" src={process.env.PUBLIC_URL + '/images/logo.png'}  width = "70rem" alt = "logo"/></span>
                                    </div>

                                </div>

                            </div>
                            <div className="mx-auto order-0" >
                                <div className="navbar-brand"><span className="mb-0 h1"> SageTomo </span></div>
                            </div>
                            <div className="navbar-collapse collapse w-100 order-3 dual-collapse2 margin_right_05 ">
                                <div className="navbar-nav ml-auto">
                                    {principal !== true &&
                                        <div className="nav-item  border margin_right_02"  id = "e1">
                                            <span className = "nav-link active cursor_puntero" onClick = {() => this.access_home()}> Home </span>
                                        </div>
                                    }
                                    <div className="nav-item  border margin_right_02"  id = "e2">
                                        <span className = "nav-link active cursor_puntero" onClick = {() => this.setModalHelp(true)} > Help </span>
                                    </div>
                                     {}
                                     {}
                                     <div className="nav-item active border dropdown cursor_puntero" id = "e3" onClick = {() => this.abre_menu()}>
                                        <span className="nav-link dropdown-toggle " data-toggle="dropdown">Your account: {sessionStorage.usuario}</span>
                                        <div className="dropdown-menu desplegable " id = "dropdown-menu">
                                            <span className="dropdown-item" onClick = {() => this.access_account()}> Edit account</span>
                                            <span className="dropdown-item" onClick = {() => this.close_session()}> Log out</span>
                                        </div>
                                    </div> 
                                    
                                </div>
                            </div>
                        </nav>
                    </div>
                ):( //HEADER WITHOUT ACCOUNT
                    <div> 
                        <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top border border-secondary" >
                            <div className="navbar-collapse collapse w-100 order-1 order-md-0 dual-collapse2 ">
                                <div className="navbar-nav mr-auto" >
                                </div>

                            </div>
                            <div className="mx-auto order-0" >
                                <div className="navbar-brand header_without_account1"  ><span className="mb-0 h1">SageTomo</span></div>
                            </div>
                            <div className="navbar-collapse collapse w-100 order-3 dual-collapse2">
                                <div className="navbar-nav ml-auto">
                                <div className="nav-item  border margin_right_02"  id = "e2">
                                        <span className = "nav-link active cursor_puntero" onClick = {() => this.setModalHelp(true)}> Help </span>
                                    </div>
                                </div>
                            </div>
                        </nav>
                    </div>)
                }

                <ModalHelp
                    show = {this.state.showModalHelp}
                    close = {() => this.setModalHelp(false)}
                    cabecera = "Help"
                    message = {this.props.help_message}
                />
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
            </div>
        );
    }
}

export default Header;
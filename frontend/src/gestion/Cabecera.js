import React, { Component } from 'react'
import {Redirect} from "react-router-dom";
import axios from 'axios';
import ModalAyuda from './ModalAyuda';
import { Dropdown, DropdownButton } from "react-bootstrap";

class Cabecera extends Component{
    //Cabecera de todas las vistas con sesión iniciada del sistema.
    constructor(props){
        super(props);
        this.state = {
            aCuenta: false,
            aInicio: false,
            aPrincipal: false,
            nombre: "",
            apellidos: "",
            correo: "",
            showModalAyuda: false,
          }
        //this.carga = this.carga.bind(this);
        //this.handleUsuarioChange = this.handleUsuarioChange.bind(this);
        //this.handleContrasenhaChange = this.handleContrasenhaChange.bind(this);
    }



    abre_menu(){
        document.getElementById("dropdown-menu").classList.toggle("show");
    }
 
    acceder_principal(){
        this.setState({aPrincipal: true});
    }

    acceder_cuenta(){
        console.log("Acceder cuenta.")

        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.token,
            }
        }
        console.log('Token ' + sessionStorage.token);
        axios.get(this.props.url_base + "api_tomo/dj-rest-auth/user/", config)
            .then(
                response => {
                    console.log("ACCEDER CUENTA");
                    this.setState({ aCuenta: true, 
                                    nombre : response.data.first_name,
                                    apellidos: response.data.last_name,
                                    correo: response.data.email});
                    console.log(response);

                })
            .catch(error => {
                //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
                console.error('Se ha producido un error.', error);
            });
        
    }

    cerrar_sesion(){
        console.log("Cerrar sesión.")

        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.token,
            }
        }
        axios.post(this.props.url_base + "api_tomo/dj-rest-auth/logout/", config)
            .then(
                response => {
                    this.setState({ aInicio: true});
                })
            .catch(error => {
                //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
                console.error('Se ha producido un error.', error);
            });
        
    }

    setModalAyuda(estado){
        this.setState({showModalAyuda: estado});
    }

    render(){
        if (this.state.aCuenta === true) {
            return <Redirect push to={{
                pathname: '/cuenta',
                state: { nombre: this.state.nombre,
                         apellidos: this.state.apellidos,
                         correo: this.state.correo,
                         token: this.props.token,
                         url_base: this.props.url_base}
            }}/>
        }


        if (this.state.aInicio === true) {
            return <Redirect push to={{
                pathname: '/',
                state: { token: this.props.token, url_base: this.props.url_base}
            }}/>        
        }

        if (this.state.aPrincipal === true) {
            return <Redirect push to={{
                pathname: '/principal',
                state: { token: this.props.token, url_base: this.props.url_base}
            }}/>        
        }



        const con_cuenta = this.props.con_cuenta;
        const principal = this.props.principal;
        return(
            <div>
                
                {con_cuenta === true ?( //CABECERA CON CUENTA
                    <div >
                        <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top border border-secondary cabecera_con_cuenta">
                            <div className="navbar-collapse collapse w-100 order-1 order-md-0 dual-collapse2 " >
                                <div className="navbar-nav mr-auto" >
                                    <div className="nav-item">
                                        <span><img  className="img-responsive" src={process.env.PUBLIC_URL + '/imagenes/logo.png'}  width = "70rem" alt = "logo"/></span>
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
                                            <span className = "nav-link active cursor_puntero" onClick = {() => this.acceder_principal()}> Home </span>
                                        </div>
                                    }
                                    <div className="nav-item  border margin_right_02"  id = "e2">
                                        <span className = "nav-link active cursor_puntero" onClick = {() => this.setModalAyuda(true)} > Help </span>
                                    </div>

                                     <div className="nav-item active border dropdown cursor_puntero" id = "e3" onClick = {() => this.abre_menu()}>
                                        <span className="nav-link dropdown-toggle " data-toggle="dropdown">Your account: {sessionStorage.usuario}</span>
                                        <div className="dropdown-menu desplegable " id = "dropdown-menu">
                                            <span className="dropdown-item" onClick = {() => this.acceder_cuenta()}> Edit account</span>
                                            <span className="dropdown-item" onClick = {() => this.cerrar_sesion()}> Log out</span>
                                        </div>
                                    </div> 
                                    
                                </div>
                            </div>
                        </nav>
                    </div>
                ):( //CABECERA SIN CUENTA
                    <div> 
                        <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top border border-secondary" >
                            <div className="navbar-collapse collapse w-100 order-1 order-md-0 dual-collapse2 ">
                                <div className="navbar-nav mr-auto" >
                                </div>

                            </div>
                            <div className="mx-auto order-0" >
                                <div className="navbar-brand cabecera_sin_cuenta1"  ><span className="mb-0 h1">SageTomo</span></div>
                            </div>
                            <div className="navbar-collapse collapse w-100 order-3 dual-collapse2">
                                <div className="navbar-nav ml-auto">
                                <div className="nav-item  border margin_right_02"  id = "e2">
                                        <span className = "nav-link active cursor_puntero" onClick = {() => this.setModalAyuda(true)}> Help </span>
                                    </div>
                                </div>
                            </div>
                        </nav>
                    </div>)
                }

                <ModalAyuda
                    show = {this.state.showModalAyuda}
                    cerrar = {() => this.setModalAyuda(false)}
                    cabecera = "Help"
                    mensaje = {this.props.mensaje_ayuda}
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

export default Cabecera;
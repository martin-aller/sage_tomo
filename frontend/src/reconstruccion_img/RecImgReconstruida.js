import React, { Component } from 'react'
import Cabecera from '../gestion/Cabecera';
import BotonAtras from '../gestion/BotonAtras';
import SinSesion from '../gestion/SinSesion'
import Cargar from '../gestion/Cargar'
import {Redirect} from "react-router-dom";


import axios from 'axios';

class RecImgReconstruida extends Component{
    //Vista con las imágenes (real y predicha) reconstruidas de una malla de un dataset.

    constructor(props){
        super(props);
        this.state = {
            modelo: null,
            dataset: null,
            indice_malla: null,
            postprocesar: null,
            url_real: null,
            url_reconstruida: null,
            conductividades_predichas: null,
            reconstruyendo_img: true,
            y_cortes: 0,
            enfoque_corte : React.createRef(),
            url_cortes: null,
            error_modelo: false,
            mensaje_ayuda: <div><p>En esta ventana se muestran dos imágenes. La imagen de la izquierda es la imagen real asociada a la malla seleccionada en la ventana
                    anterior. La imagen de la derecha es la imagen reconstruida mediante el modelo elegido.</p>
                    <p>Debajo de ambas imágenes, se encuentra la herramienta para realizar cortes en las mallas. Mediante el selector que se te proporciona,
                    podrás elegir el valor del eje Y de la malla en el cual deseas realizar el corte. Al pulsar en Analizar sección, se generará una gráfica 
                    que mostrará los valores de conductividad de la malla para el valor del eje Y seleccionado.</p></div>
          }

          this.handleChangeYCorte = this.handleChangeYCorte.bind(this);
          this.enfocar_corte = this.enfocar_corte.bind(this);


    }


    componentDidMount(){
        this.setState({
            modelo: this.props.location.state.modelo,
            dataset: this.props.location.state.dataset,
            indice_malla: this.props.location.state.indice_malla,
            postprocesar: this.props.location.state.postprocesar,
        });
   
        console.log("INCLUSO ANTES");
        var conductividades = this.reconstruir_imagen(this.props.location.state.modelo,
                           this.props.location.state.dataset,
                           this.props.location.state.indice_malla,
                           this.props.location.state.postprocesar);
                
    }

    componentDidUpdate(){
        console.log("HOLAAAAAAAAAAAAAAAAAAAAAAAAAAAa")
        window.scrollTo(0,10000);
    }

    enfocar_corte(){
        var y = document.body.scrollHeight;
        y = 2*document.body.scrollHeight;
        window.scrollTo(0,y);

    }

    enfocar_corte2(){
        console.log("ENFOQUEEEEEEEEEEEEEEEEEEEEE2222222222222EEEEEEE")
        this.state.enfoque_corte.current.focus();
    }



    handleChangeYCorte(event){
        var value = event.target.value;
        console.log("VALOR: ", value);
        value = Math.max(Number(-1), Math.min(Number(1), Number(value)));
        console.log("VALOR: ", value);
        this.setState({y_cortes: value});
    }


    reconstruir_imagen(modelo, dataset, malla, postprocesar){
        //console.log("POSTPROCESADO IMG: ", this.state.postprocesado);
        //this.setState({reconstruyendo_imagen:true});
        var conductividades = null;

        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        axios.get(this.props.location.state.url_base + "api_tomo/reconstruir_img/?dataset=" + dataset +
                "&indice=" + malla + 
                "&modelo=" + modelo + 
                "&postprocesar=" + postprocesar, config)
        .then(
            response => {
                console.log("Rec Img.");
                this.setState({reconstruyendo_img:false,
                                url_real: response.data.url_real,
                                url_reconstruida: response.data.url_reconstruida,
                                conductividades_predichas: response.data.conductividades_predichas,
                                });

            })
        .catch(error => {
            this.setState({error_modelo : true});
            console.error('Se ha producido un error al reconstruir imagen.', error);
        }); 

    }


    realizar_corte(conductividades, y_cort){
        console.log("Se ejecuta por supuesto")
        //console.log(Date.now());
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        const par = {
            dataset : this.props.location.state.dataset,
            indice : this.props.location.state.indice_malla,
            y : y_cort,
            conductividades : conductividades,
        }

        //console.log("LONGITUD: ", this.state.conductividades_predichas);

        console.log(par);

        axios.post(this.props.location.state.url_base + "api_tomo/genera_corte/", par, config)
        .then(
            response => {
                console.log("Cortes.");
                this.setState({
                                url_cortes: response.data.cortes,
                                });
                //this.enfocar_corte2();
                //document.getElementById("imm").focus(); 
                //this.enfocar_corte();
                console.log(response.data);
                //document.getElementById("pru").removeAttribute("hidden");

            })
        .catch(error => {
            console.error('Se ha producido un error.', error);
        }); 
    }


    render(){
        console.log("Se ejecuta PRUEBA")
        var mensaje_modelo = "El modelo seleccionado ya no se encuentra en el sistema.";
        if (this.state.error_modelo === true) {
            return <Redirect push to={{
                pathname: '/sin_modelo',
                state: { token: this.props.location.state.token, 
                        url_base: this.props.location.state.url_base,
                        mensaje: mensaje_modelo}
            }}/>        
        }

        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Cabecera con_cuenta = {true} mensaje_ayuda = {this.state.mensaje_ayuda} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <BotonAtras/>
        
        
                        {this.state.reconstruyendo_img === true ? (
                            
                            <Cargar
                                completo = {true} 
                                cabecera = {"Reconstruction of mesh " + this.state.indice_malla + ". Dataset " + this.state.dataset}
                                mensaje = "Reconstructing image. This operation may take a few seconds."
                            />
                        ):(
                            <div>
                                <h2 className = "text-center" > Reconstruction of mesh {this.state.indice_malla}. Dataset {this.state.dataset} </h2>
        
                                <br/>
                                <div className = "container text-center">
                                    <div className="row">
                                        <div className="card col-md-6 caja width_14" >
                                            <div className = "container">
                                                <h5 className="card-title text-center margin_top_1">Actual electrical conductivity values</h5>
                                                <img className="card-img-top img_rec border border-dark text-center" src={"http://" + this.state.url_real} alt="Card image cap"/>
                                            </div>
                                        </div>
        
                                        <div className="card col-md-6 caja width_14">
                                            <div className = "container">
                                                <h5 className="card-title text-center margin_top_1">Predicted electrical conductivity values</h5>
                                                <img className="card-img-top img_rec border border-dark text-center" src={"http://" + this.state.url_reconstruida} alt="Card image cap"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                
                                <br/>
                                <div  className = "container card text-center caja" id = "contenedor_cortes" >
                                    <div className="card-body" >
                                        <h5 className="card-title text-center"> Mesh cutting</h5>
                                        {this.state.url_cortes !== null &&
                                                <img className = "border border-dark margin_bottom_1" autoFocus id = "pru" src={"http://" + this.state.url_cortes} /> 
                                        }  
                                        <p className="card-text">Select the value of the Y-axis to do the cutting:</p>
                                        <input type="range" name="rango_input" min="-1" max="1" step="0.1"
                                               value = {this.state.y_cortes} onChange={this.handleChangeYCorte} />
                                        <input type="number" id="texto_rango" name = "y" min="-1" max="1" step="0.1" 
                                               value = {this.state.y_cortes} onChange={this.handleChangeYCorte} />	
                                        <div className = "text-center">
                                            <input type="button" className="btn btn-dark mb-2 margin_top_2"  value = "Analyze section" 
                                                    onClick = {() => this.realizar_corte(this.state.conductividades_predichas, this.state.y_cortes)}/> 
                                        </div>
        
                                        <div></div>                                   
                                    </div>
        
                                </div>
                            </div>
                        )}
        
        
        
        
                    </div>
                ):(
                    <SinSesion/>
                )}

            </div>
        );
    }
}



export default RecImgReconstruida;




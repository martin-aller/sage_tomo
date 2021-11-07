import React, { Component } from 'react'
import Cabecera from '../gestion/Cabecera';
import BotonAtras from '../gestion/BotonAtras';
import SinSesion from '../gestion/SinSesion'
import Cargar from '../gestion/Cargar'
import {Redirect} from "react-router-dom";
import axios from 'axios';


class RecImgPrediccionRealizada extends Component{
    //Vista que se muestra al usuario cuando sube un fichero de voltajes y realiza
    //una predicción de conductividades. Se le muestran las conductividades predichas y se
    //le permite reconstruir las imágenes de esas mallas.

    constructor(props){
        super(props);
        this.state = {
            predicciones: null,
            realizando_predicciones: true,
            url_img: null,
            indices: new Array(844),
            indice_seleccionado: null,
            indice_img_reconstruida: null, //Necesario para que no cambie el número de la imagen al seleccionar otra malla
            error_seleccion: false,
            aSubirVoltajes: false,
            reconstruyendo_img: false,
            indice_inicial: 0,
            mostrar_btn_anterior: false,
            mostrar_btn_siguiente: true,
            error_modelo: false,
            mensaje_ayuda: <p>This window displays the predictions made for the set of voltages uploaded to the system. Each of the rows
            of the lower table contains the predicted conductivity values for a given mesh. By selecting one of these meshes and
            clicking on Reconstruct image, the image associated with the predictions will be generated.</p>

          }
    }

    componentDidMount(){
        this.subir_voltajes();
    }

    
    modifica_indice(valor){
        var valor_aux = this.state.indice_inicial + valor;
        var indice_final_aux = valor_aux + 10
        //console.log(this.state.lista_mallas.slice(valor_aux, indice_final_aux).length);

        if(this.state.predicciones.conductividades_predichas.slice(valor_aux, indice_final_aux).length === 0){
            console.log("NO HAY MÁS MALLAS");
            this.setState({mostrar_btn_siguiente: false})
        }else if(valor_aux <= 0){
            console.log("PRIMERA PÁGINA");
            this.setState({indice_inicial: 0, mostrar_btn_siguiente: true, mostrar_btn_anterior: false})
        }
        else{
            this.setState({indice_inicial: valor_aux, mostrar_btn_siguiente: true, mostrar_btn_anterior: true})
        }
    }


    subir_voltajes(){
        console.log("probando");
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
              //'Content-Disposition': this.state.fichero.filename,
            }
        }

        const formData = new FormData(); 
        formData.append("file", this.props.location.state.fichero);
        formData.append("modelo", this.props.location.state.id_modelo);


        axios.post(this.props.location.state.url_base + "api_tomo/predecir_conductividades/", formData,config)
        .then(
            response => {
                console.log("Subir voltajes.");
                console.log(response.data);
                this.setState({predicciones: response.data, realizando_predicciones: false});
            })
        .catch(error => {
            console.log("ERROR CODE:", error.response.status);
            console.error('Se ha producido un error.', error);
            if(error.response.status === 404){
                this.setState({error_modelo: true});
            }else{
                this.setState({aSubirVoltajes: true});
            }

        }); 
    }

    redondea_num(num){
        return Math.round((num + Number.EPSILON) * 100) / 100; //Number.Epsilon para números como 1.005
    }




    reconstruir_img(){
        if(this.state.indice_seleccionado === null){
            this.setState({error_seleccion: true});
        }else{
            this.setState({reconstruyendo_img: true});
            const config = {
                headers: {
                  'Authorization': 'Token ' + this.props.location.state.token
                }
            }

            const par = {
                modelo : this.props.location.state.id_modelo,
                conductividades: this.state.predicciones.conductividades_predichas[this.state.indice_seleccionado],
            }
    
            axios.post(this.props.location.state.url_base + "api_tomo/reconstruir_img_simple/", par, config)
            .then(
                response => {
                    console.log("Rec Img.");
                    this.setState({url_img: response.data.url_img, 
                                   indice_img_reconstruida: this.state.indice_seleccionado, 
                                   reconstruyendo_img: false});
                    console.log(response.data);
                })
            .catch(error => {
                console.error('Se ha producido un error.', error);
            }); 
        }

    }




    render(){
        console.log("Se ejecuta Prediccion realizada");
        var mensaje_modelo = "El modelo seleccionado ya no se encuentra en el sistema.";

        if (this.state.error_modelo === true) {
            return <Redirect push to={{
                pathname: '/sin_modelo',
                state: { token: this.props.location.state.token, 
                        url_base: this.props.location.state.url_base,
                        mensaje: mensaje_modelo}
            }}/>        
        }

        if (this.state.aSubirVoltajes === true) {
            console.log("LLEGA HASTA AQUÍ PRINCIPAL");
            return <Redirect push to={{
                pathname: '/rec_img_subir_voltajes',
                state: { id_modelo: this.props.location.state.id_modelo,
                         error_estructura: true,
                         token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }


        var indice_final = this.state.indice_inicial + 9;

        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Cabecera con_cuenta = {true} mensaje_ayuda = {this.state.mensaje_ayuda} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <BotonAtras/>
        
        
                        {this.state.realizando_predicciones === true ? (
                            <Cargar
                                completo = {true} 
                                cabecera = "Prediction of conductivities"
                                mensaje = "Uploading file and making predictions. This operation may take a few seconds."
                            />
                        ):(
                            <div>
                                <div className="card bg-light mx-auto mb-3 caja max_width_50">
                                    <div className="card-header"><b>Predictions completed</b></div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-12 width_14" >
                                                <p><b>Number of predictions:</b> {this.state.predicciones.conductividades_predichas.length}</p>
                                                <p><b>Model used (ID):</b> {this.props.location.state.id_modelo}</p>
                                            </div>
        
                                        </div>
                                    </div>
                                </div>
                        
        
                            
                                {this.state.reconstruyendo_img === true ? (
                                    <div className = "container">
                                        <br/>
                                        <div className="row" id = "cargar">
                                            <div className = "col text-center">
                                                <div className="spinner-border text-dark cargador_grande" role="status">
                                                </div>
                                            </div>
                                        </div>
        
                                        <div className="alert alert-primary" role="alert" id = "mensaje_informativo">
                                            Reconstructing image. This operation may take a few seconds.
                                        </div>
                                    </div>
                                ):(
                                    <div>
                                        {this.state.url_img !== null &&
                                            <div className = "container text-center margin_bottom_2">
                                                <div className="row">
                                                    <div className = "col-md-3"></div>
                                                    <div className="card col-md-6 caja width_14">
                                                        <div className = "container">
                                                            <h5 className="card-title text-center margin_top_1">Reconstructed image of mesh {this.state.indice_img_reconstruida} </h5>
                                                            <img className="card-img-top border border-dark img_rec text-center" src={"http://" + this.state.url_img} alt="Card image cap"/>
                                                        </div>
                                                    </div>
                                                    <div className = "col-md-3"></div>
        
                                                </div>
                                            </div>
                                        }
        
                                        <div className="card bg-light mx-auto mb-3 caja max_width_50">
                                            <div className="card-header"><b>Predictions completed</b></div>
                                            <div className="card-body">
                                                <p className="card-text">Select the mesh you want to reconstruct:</p>
                                                <div className="row">
                                                    <div className="col-md-12 width_14">
                                                        <div >
                                                            <div className="row" >
                                                                        <table className = "table table-striped tabla_scroll_x tabla_scroll_y">
                                                                        <thead>
                                                                            <tr>
                                                                                <th scope="col"></th>
                                                                                <th scope="col">Mesh index</th>
                                                                                {Array.from(Array(844), (e, i) => {
                                                                                    return <td key={i}><b>V{i}</b></td>
                                                                                })}
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {this.state.predicciones.conductividades_predichas.slice(this.state.indice_inicial, indice_final).map((l_con, index)=>
                                                                                <tr key = {index}>
                                                                                    <td><input type="radio" name="grupo_mallas" value = {this.state.indice_inicial + index} 
                                                                                        onClick = {() => this.setState({indice_seleccionado: (this.state.indice_inicial + index)})} required/></td>
                                                                                    <th scope="row"> {this.state.indice_inicial + index} </th>
                                                                                    {l_con.map((con, index)=>
                                                                                        <td key = {index}>{this.redondea_num(con)}</td>
                                                                                    )}
        
                                                                                </tr>
                                                                            )}
                
                                                                        </tbody>
                                                                        </table>
        
        
        
                                                            </div>
                                                            <div className="form-group row ">
                                                                        
                                                                        <div className = "col-md-6">
                                                                            {this.state.mostrar_btn_anterior === true &&
                                                                                <input type="button"  className="btn-sm btn-dark  mb-2" 
                                                                                    onClick= {() => this.modifica_indice(-10)} id = "btn_anterior" value = "Previous"/> 
                                                                            }
                                                                        </div>
                                                                        
                                                                        
                                                                        <div className = "col-md-6">
                                                                            {this.state.mostrar_btn_siguiente === true &&
                                                                                <input type="button"  className="btn-sm btn-dark  mb-2 float-right" 
                                                                                    onClick= {() => this.modifica_indice(10)} id = "btn_siguiente" value = "Next"/>
                                                                            } 
                                                                        </div>
                                                            </div>
                                                            {this.state.error_seleccion === true &&
                                                                <div className = "row text-center margin_top_2">
                                                                    <div className = "col-md-2"></div>
                                                                    <div className="col-md-8">
                                                                        <div className="alert alert-danger">
                                                                            <p>No has seleccionado ninguna malla.</p>
                                                                        </div>                                
                                                                    </div>
                                                                    <div className = "col-md-2"></div>
                                                                </div>
                                                            }
                                                            <div className="row text-center">
                                                                <div className = "col-md-12">
                                                                    <button type="submit"  className="btn-lg btn-dark  mb-2" onClick={() => this.reconstruir_img()} id = "btn_reconstruir" > 
                                                                        Reconstruct image
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
        
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
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

export default RecImgPrediccionRealizada;
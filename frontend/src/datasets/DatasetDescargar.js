import React, { Component } from 'react'
import Cabecera from '../gestion/Cabecera';
import BotonAtras from '../gestion/BotonAtras';
import SinSesion from '../gestion/SinSesion'
import Cargar from '../gestion/Cargar';
import axios from 'axios';


class DatasetDescargar extends Component{
    //Vista de descarga de un dataset.
    constructor(props){
        super(props);
        this.state = {
            preparando_descarga: true,
            url_descarga: null,

          }
    }

    componentDidMount(){
        this.preparar_descarga();
    }


    // url_dataset = requests.get("http://127.0.0.1:8000/api_tomo/preparar_descarga_dataset/{}/".format(dataset_id), 
    //                         headers={'Authorization': 'Token {}'.format(request.session["token"])}).json()


    preparar_descarga(){
        console.log("Reconstruir imágenes.");

        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        axios.get(this.props.location.state.url_base + "api_tomo/preparar_descarga_dataset/"+ this.props.match.params.id +"/", config)
        .then(
            response => {
                console.log("ÉXITO EN LA PREPARACIÓN DE DESCARGA.");
                this.setState({url_descarga: response.data.url_dataset, preparando_descarga: false});
                console.log("DESCARGA PREPARADA: ", response.data);
                //console.log(response.data[0].creador.username);
                //console.log("CREADOR: ", response.data[1])

            })
        .catch(error => {
            console.error('Se ha producido un error.', error);
        });
    }

    render(){
        console.log("Se ejecuta DESCARGAR")

        
        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Cabecera con_cuenta = {true} mensaje_ayuda = {this.state.mensaje_ayuda} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <BotonAtras/>
        
                        {this.state.preparando_descarga === true ? (
                            <Cargar
                                completo = {true} 
                                cabecera = "Dataset downloading"
                                mensaje = "Preparing to download the dataset. This operation may take a few seconds."
                            />
                        ):(
                            <div className="card bg-light mx-auto mb-3 caja max_width_50">
                                <div className="card-header">Download for dataset {this.props.match.params.id} is ready</div>
                                <div className="card-body text-center">
                                    <h5 className="card-title">Click on <i>Download dataset</i> to start the download:</h5>
                                    <a href={"http://" + this.state.url_descarga} className = "btn btn-dark mb-2" download={"dataset" + this.props.match.params.id + ".csv"}>Download dataset</a>
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

export default DatasetDescargar;
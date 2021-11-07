import React, { Component } from 'react'
import Cabecera from '../gestion/Cabecera';
import BotonAtras from '../gestion/BotonAtras';
import SinSesion from '../gestion/SinSesion'
import axios from 'axios';



class DatasetDetalles extends Component{
    //Vista de los detalles de un dataset particular
    constructor(props){
        super(props);
        this.state = {
            dataset: null,
            cargando: true,
            mensaje_ayuda: <span>This window shows all the details from the selected dataset. The seed attribute refers to the seed used to generate the artifacts. </span>
          }

    }

    componentDidMount(){
        this.get_detalles_dataset();
    }

    get_detalles_dataset(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        const id_dataset = this.props.match.params.id;
        console.log("ID del dataset: ", id_dataset);

        axios.get(this.props.location.state.url_base + "api_tomo/datasets/" + id_dataset + "/", config)
        .then(
            response => {
                console.log("Obtener detalles dataset.");
                this.setState({dataset: response.data, cargando: false});
                console.log(response.data);
                

            })
        .catch(error => {
            //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
            console.error('Se ha producido un error.', error);
        });
    }

    obtiene_fecha(datetime){
        var fecha = "";
        fecha = datetime.split("T")[0];
        return fecha;
    }

    render(){
        console.log("Se ejecuta Datasets Detalles");
        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Cabecera con_cuenta = {true} mensaje_ayuda = {this.state.mensaje_ayuda} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <BotonAtras/>
        
                        {this.state.cargando === true ? (
                            <div className="row" id = "cargar">
                                <div className = "col text-center">
                                    <div className="spinner-border text-dark cargador" role="status">
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="card bg-light mx-auto mb-3 caja max_width_50">
                                <div className="card-body">
                                    <h5 className="card-title"><b>Dataset details</b></h5>
                                    <table className = "table table-striped" >
                                    <tbody>
                                        <tr>
                                            <th scope="row">Id: </th>
                                            <td>{this.state.dataset.id}</td>
                                        </tr>
        
                                        <tr>
                                            <th scope="row">Minimum radius of artifacts: </th>
                                            <td>{this.state.dataset.r_min}</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Maximum radius of artifacts: </th>
                                            <td>{this.state.dataset.r_max}</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Creator: </th>
                                            <td>{this.state.dataset.creador.username}</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Creation date: </th>
                                            <td>{this.obtiene_fecha(this.state.dataset.fecha_creacion)}</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Seed: </th>
                                            <td> {this.state.dataset.semilla}</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Visibility: </th>
                                            {this.state.dataset.visible === true ? (
                                                <td>Public</td>
                                            ):(
                                                <td>Private</td>
                                            )}
                                        </tr>
        
                                    
                                        {this.state.dataset.n_mallas > 0 &&
                                            
                                                <tr>
                                                    <th scope="row">Total number of meshes: </th>
                                                    <td> {this.state.dataset.n_mallas}</td>
                                                </tr>
                                        }
        
                                        {this.state.dataset.n_mallas > 0 &&
                                            <tr>
                                                <th scope="row">Number of meshes with one artifact: </th>
                                                <td> {this.state.dataset.n_mallas_1} </td>
                                            </tr>
                                        }
        
                                        {this.state.dataset.n_mallas > 0 &&
                                                <tr>
                                                    <th scope="row">Number of meshes with two artifacts: </th>
                                                    <td>{this.state.dataset.n_mallas_2}</td>
                                                </tr>
                                        }                                
                                        {this.state.dataset.n_mallas > 0 &&
                                                <tr>
                                                    <th scope="row">Number of meshes with three artifacts: </th>
                                                    <td>{this.state.dataset.n_mallas_3}</td>
                                                </tr>
                                        } 
        
        
                                            
                                                
                                        
                                        
        
                                    </tbody>
                                    </table>
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

export default DatasetDetalles;
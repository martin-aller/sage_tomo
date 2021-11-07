import React, { Component } from 'react'
import Cabecera from '../gestion/Cabecera';
import BotonAtras from '../gestion/BotonAtras';
import SinSesion from '../gestion/SinSesion'
import {Redirect} from "react-router-dom";
import axios from 'axios';


class RecImgMallasDatasets extends Component{
    //Vista con los datasets y las mallas del dataset seleccionado.
    //Esta vista permite al usuario seleccionar qué malla desea reconstruir.
    //También permite al usuario filtrar las mallas por número de artefactos.
    
    constructor(props){
        super(props);
        this.state = {
            lista_datasets : [],
            lista_mallas: [],
            aImgRec : false,
            n_art : "1",
            id_dataset : null,
            indice_malla: null,
            id_detalles: null,
            cargando_datasets: true,
            cargando_mallas: true,
            indices: new Array(844),
            postprocesado: "True",
            indice_inicial: 0,
            mostrar_btn_anterior: false,
            mostrar_btn_siguiente: true,
            mensaje_ayuda: <p>In this window, you can reconstruct images associated with the meshes belonging to the datasets stored in the system. 
                To do so, in the upper table, you must select the dataset you want to use. By default, the dataset with the lowest identifier 
                is selected. In the table below, you can select the mesh from the chosen dataset you want to examine. You can 
                filter the meshes according to the number of artifacts they contain.</p>

          }
          this.handleChangePostprocesado = this.handleChangePostprocesado.bind(this);
          this.handleChangeArtefactos = this.handleChangeArtefactos.bind(this);

    }

    componentDidMount(){
        console.log("ÍNDICES: ", this.state.indices);
        this.get_datasets();
        
        //setTimeout(500);

        //this.get_mallas(this.state.id_dataset);
    }

    modifica_indice(valor){
        var valor_aux = this.state.indice_inicial + valor;
        var indice_final_aux = valor_aux + 10
        //console.log(this.state.lista_mallas.slice(valor_aux, indice_final_aux).length);

        if(this.state.lista_mallas.slice(valor_aux, indice_final_aux).length === 0){
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


    handleChangeArtefactos(event){
        this.setState({n_art: event.target.value});
    }


    handleChangePostprocesado(event){
        if(this.state.postprocesado === "True"){
            this.setState({postprocesado:"False"});
        }else if(this.state.postprocesado === "False"){
            this.setState({postprocesado:"True"});

        }
    }

    get_datasets(){
        
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        axios.get(this.props.location.state.url_base + "api_tomo/datasets/", config)
        .then(
            response => {
                //console.log("Obtener datasets.");
                //console.log("Menor dataset: ", response.data[response.data.length - 1].id);
                var id_menor_dataset = response.data[response.data.length - 1].id;
                this.setState({lista_datasets: response.data,
                               id_dataset: id_menor_dataset,    
                               cargando_datasets: false}, () => {this.get_mallas(id_menor_dataset)}); //
                //Se ejecuta la función de obtener las mallas después de la actualización del estado
            })
        .catch(error => {
            //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
            console.error('Se ha producido un error.', error);
        });
        //console.log("A VER SEGUNDO: ", menor_dataset);
    }

    ver_detalles_dataset(id){
        this.setState({id_detalles : id});
    }


    get_mallas(dataset){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        const url_mallas = this.props.location.state.url_base + "api_tomo/conductividades/?dataset=" + dataset +
                            "&numero_artefactos="+ this.state.n_art +
                            "&indice_inicio="+ "0" +
                            "&indice_fin=" + "100000"; 

        axios.get(url_mallas, config)
        .then(
            response => {
                console.log("Obtener datasets.");
                this.setState({lista_mallas: response.data, cargando_mallas: false});
                console.log(response.data);
                //console.log(response.data[0].creador.username);
                //console.log("CREADOR: ", response.data[1])

            })
        .catch(error => {
            //this.setState({ mensaje_error: "Nombre de usuario o contraseña incorrectos"});
            console.error('Se ha producido un error.', error);
        });
    }

    filtrar_mallas(){
        this.setState({cargando_mallas:true});
        this.get_mallas(this.state.id_dataset);
    }


    cambiar_dataset(){
        var grupo = document.getElementsByName('lista_datasets');
        var dataset = null;

        for (var i=0; i<grupo.length; i++) {
            if (grupo[i].type === 'radio' && grupo[i].checked) {
                console.log("Valor: ",grupo[i].value);
                dataset = grupo[i].value;
                break;
            }
        }

        
        this.setState({id_dataset: dataset, cargando_mallas: true, indice_inicial: 0});
        this.get_mallas(dataset);
        
    
    }

    mensaje_artefactos(n){
        if(n === "1"){
            return (<b>one artifact</b>);
        }else if(n === "2"){
            return (<b>two artifacts</b>);
        }else if (n === "3"){
            return (<b>three artifacts</b>);
        }

        return (<b></b>);

    }



    acceder_img_reconstruida(){
        var grupo = document.getElementsByName('grupo_mallas');
        var malla = null;

        for (var i=0; i<grupo.length; i++) {
            if (grupo[i].type === 'radio' && grupo[i].checked) {
                console.log("Valor: ",grupo[i].value);
                malla = grupo[i].value;
                break;
            }
        }

        this.setState({indice_malla: malla, aImgRec:true});
    }



    obtiene_fecha(datetime){
        var fecha = "";
        fecha = datetime.split("T")[0];
        return fecha;
    }

    render(){
        console.log("Se ejecuta PRUEBA")

        if (this.state.id_detalles !== null) {
            return <Redirect push to={{
                pathname: '/datasets/' + this.state.id_detalles,
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        if (this.state.aImgRec === true) {
            //console.log("IR A DETALLES.")
            return <Redirect push to={{
                pathname: "/rec_img_reconstruida",
                state: { dataset: this.state.id_dataset,
                         indice_malla: this.state.indice_malla,
                         modelo: this.props.location.state.id_modelo,
                         postprocesar: "True",
                         token: this.props.location.state.token, url_base: this.props.location.state.url_base
                        }
            }}/>        
        }

        var indice_final = this.state.indice_inicial + 9;
        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Cabecera con_cuenta = {true} mensaje_ayuda = {this.state.mensaje_ayuda} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <BotonAtras/>
        
                        <h2 className = "text-center" > <b>Reconstruction of images</b> </h2>
        
        
                            <div className="container" >
                                <br/>
                                <div  className="row margin_bottom_2">
        
                                    <div className="card col-md-12 caja width_14">
                                        <div className="card-body ">
        
        
                                                <div className = "row">
                                                    <div className = "col-md-12">
        
                                                        <div className="card float-right caja2 margin_bottom_2">
                                                            <div className="card-header">
                                                                <b>Loaded dataset (ID)</b>: 
                                                            </div>
                                                            <div className="card-body text-center">
                                                            <h3 className="card-text" >{this.state.id_dataset}</h3>
                                                            </div>
                                                        </div>
        
                                                        <div className="card float-right caja2 caja_img1">
                                                            <div className="card-header">
                                                                <b>Selected model (ID)</b>: 
                                                            </div>
                                                            <div className="card-body text-center">
                                                            <h3 className="card-text" >{this.props.location.state.id_modelo} </h3>
                                                            </div>
                                                        </div>
        
                                                        <h5 className="card-title">List of datasets </h5>
                                                        <p className="card-text">Select the dataset whose meshes you wish to examine. </p>
        
                                                            {this.state.cargando_datasets === true ? (
                                                                <div className="row" id = "cargar">
                                                                    <div className = "col text-center">
                                                                        <div className="spinner-border text-dark cargador" role="status">
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ):(
                                                                <table className = "table table-striped tabla_scroll_x tabla_scroll_y_20">
                                                                    <thead>
                                                                        <tr>
                                                                            <th scope="col" className = "ancho_col"></th>
                                                                            <th scope="col" className = "ancho_col">Id </th>
                                                                            <th scope="col" className = "ancho_col">Creator </th>
                                                                            <th scope="col" className = "ancho_col">Creation date </th>
                                                                            <th scope="col" className = "ancho_col">Number of meshes </th>
                                                                            <th scope="col" className = "ancho_col"></th>
                                                                        </tr>
                                                                    </thead>
        
                                                                    <tbody>
        
                                                                            {this.state.lista_datasets.map( (dataset) =>
                                                                                <tr key = {dataset.id}>
                                                                                    {this.state.id_dataset === null ? (
                                                                                        <td><input type="radio" name = "lista_datasets" value = {dataset.id}/></td>
        
                                                                                    ):(
                                                                                        <td><input type="radio" name = "lista_datasets" value = {dataset.id} defaultChecked/></td>
        
                                                                                    )}
                                                                                    <th scope="row" >{dataset.id}</th>
        
                                                                                    <td>{dataset.creador.username}</td>
                                                                                    <td>{this.obtiene_fecha(dataset.fecha_creacion)}</td>
                                                                                    <td>{dataset.n_mallas}</td>
                                                                                    <td> <span className = "btn-link cursor_puntero" onClick = {() => this.ver_detalles_dataset(dataset.id)}> View details</span> </td>
        
        
                                                                                </tr>
                                                                            )}
        
        
                                                                    </tbody>
                                                                </table>
                                                            )}
                                                            
                                                    </div>					
                                                </div>
        
                                                {this.state.error_dataset && 
                                                    <div className = "row text-center margin_top_2">
                                                        <div className = "col-md-3"></div>
                                                        <div className="col-md-6">
                                                            <div className="alert alert-danger">
                                                                <p>No has seleccionado ningún dataset.</p>
                                                            </div>                                
                                                        </div>
                                                        <div className = "col-md-3"></div>
                                                    </div>
                                                }
                                                <div className = "row text-center">
                                                    <div className = "col-md-12">
                                                        <button type="submit" className="btn btn-dark  mb-2" id = "btn_dataset" onClick ={() => this.cambiar_dataset()}> 
                                                            Change dataset
                                                        </button>
                                                    </div>
                                                </div>
                                        </div>
                                    </div>
        
                                </div>
        
        
                                <div className="row">
                                    <div className = "card col-md-3 caja" >
        
        
                                        <div className="card-body">
                                            <h5 className="card-title">Number of artifacts</h5>
                                            <div>
                                                
                                                <div className="form-group row margin_top_2">
                                                    <label htmlFor="n_artefactos" className="col-sm-6 col-form-label"> Number of artifacts: </label>
                                                    <div className="col-sm-6 margin_top_1">
                                                        <select value = {this.state.n_art} onChange={this.handleChangeArtefactos}className="form-control">
        
                                                                <option  value = "1"> 1 </option>
                                                                <option value = "2"> 2 </option>
                                                                <option value = "3"> 3 </option>
        
        
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="form-group row text-center caja_img2">
                                                    <div className = "col-md-12">
                                                        <input type="button"  className="btn btn-dark  mb-2" id = "btn_filtrar" onClick ={() => this.filtrar_mallas()} value = "Filter meshes"/> 
                                                            
                                                        
                                                    </div>
                                                </div>
                                            </div>
        
                                            <hr/>
                                            <div className = "text-center"> 
                                                <h5> Apply postprocessing in the reconstruction:</h5>
                                                <br/>
                                                <label> Yes <input className = "width_3" type="radio" name = "postprocesar" id = "post_true" value = "True" onChange = {this.handleChangePostprocesado} defaultChecked /> </label>
                                                <label> No <input className = "width_3" type="radio" name = "postprocesar" id = "post_false" value = "False" onChange = {this.handleChangePostprocesado} />  </label>
                                            </div>
        
                                        </div>
                                    </div>
                                    <div className = "col-md-9">
                                        <form action="{% url 'tomo:reconstruir_imagen' %}" method = "post">
                                            <div className="row" >
                                                
                                                
                                                <div className="card col-md-12 caja width_14">
                                                    <div className="card-body">
                                                        <h5 className="card-title">Dataset {this.state.id_dataset}. Meshes with {this.mensaje_artefactos(this.state.n_art)}</h5>
                                                        <p className="card-text">Select the mesh you want to reconstruct:</p>
        
                                                            {this.state.cargando_mallas === true ? (
                                                                <div className="row" id = "cargar">
                                                                    <div className = "col text-center">
                                                                        <div className="spinner-border text-dark cargador" role="status">
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ):(
                                                                <div>
                                                                    <table className = "table table-striped tabla_scroll_x table tabla_scroll_y">
                                                                        <thead>
                                                                            <tr>
                                                                                <th scope="col"></th>
                                                                                <th scope="col">Mesh index</th>
            
                                                                                {Array.from(Array(844), (e, i) => {
                                                                                    return <td key={i}><b>C{i}</b></td>
                                                                                })}
            
                                                                            </tr>
                                                                        </thead>
                                                                        {console.log("INDICE: ", this.state.indice_inicial)}
                                                                        <tbody>
                                                                            {this.state.lista_mallas.slice(this.state.indice_inicial, indice_final).map((m, index)=>
                                                                                <tr key = {m.indice}>
                                                                                    {index === 0 ? (
                                                                                        <td><input type="radio" name="grupo_mallas" value = {m.indice} defaultChecked/></td>
            
                                                                                    ):(
                                                                                        <td><input type="radio" name="grupo_mallas" value = {m.indice} /></td>
                                                                                    )}
                                                                                    <th scope="row">{m.indice}</th>
            
                                                                                    {m.conductividades.map((con, index) =>
                                                                                        <td key = {index}>{con}</td>
                                                                                    )} 
            
                                                                                
                                                                                        
                                                                                </tr>
                                                                            )}


                                                                            
                                                                        </tbody>

                                                                    </table>
                                                                    <input type = "hidden" id = "post_valor" name = "post_valor" value = ""/>
                    
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

                                                                    <div className="form-group row text-center">
                                                                        <div className = "col-md-12">
                                                                        <input type="button"  className="btn-lg btn-dark  mb-2" 
                                                                                onClick= {() => this.acceder_img_reconstruida()} id = "btn_reconstruir" value = "Reconstruct image"/> 
                                                                            
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                            )}
                                                            
                                                       
                                                        
        
                                                    </div>
                                                </div>
                                            </div>
        
                                        </form>
                                    </div>
                                </div>
                            </div>
                      
                        <br/>
        
                    </div>
                ):(
                   <SinSesion/>                                                             
                )}

            </div>
        );
    }
}

export default RecImgMallasDatasets;
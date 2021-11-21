import React, { Component } from 'react'
import Header from '../management/Header';
import GoBackButton from '../management/GoBackButton';
import NoSession from '../management/NoSession'
import {Redirect} from "react-router-dom";
import axios from 'axios';


class RecImgMeshesDatasets extends Component{
    //View with the datasets and meshes of the selected dataset.
    //This view allows the user to select which mesh to reconstruct.
    //It also allows the user to filter the meshes by number of artifacts.
    
    constructor(props){
        super(props);
        this.state = {
            datasets_list : [],
            meshes_list: [],
            aImgRec : false,
            n_art : "1",
            id_dataset : null,
            mesh_index: null,
            id_details: null,
            loading_datasets: true,
            loading_meshes: true,
            indexes: new Array(844),
            postprocessing: "True",
            initial_index: 0,
            show_btn_previous: false,
            show_btn_next: true,
            help_message: <p>In this window, you can reconstruct images associated with the meshes belonging to the datasets stored in the system. 
                To do so, in the upper table, you must select the dataset you want to use. By default, the dataset with the lowest identifier 
                is selected. In the table below, you can select the mesh from the chosen dataset you want to examine. In that table, there is one row per mesh and one column per conductivity value. 
                You can filter the meshes according to the number of artifacts they contain.</p>

          }
          this.handleChangePostprocesado = this.handleChangePostprocesado.bind(this);
          this.handleChangeArtefactos = this.handleChangeArtefactos.bind(this);

    }

    componentDidMount(){
        this.get_datasets();
    }


    modifica_index(value){
        var value_aux = this.state.initial_index + value;
        var index_final_aux = value_aux + 10

        if(this.state.meshes_list.slice(value_aux, index_final_aux).length === 0){
            this.setState({show_btn_next: false})
        }else if(value_aux <= 0){
            this.setState({initial_index: 0, show_btn_next: true, show_btn_previous: false})
        }
        else{
            this.setState({initial_index: value_aux, show_btn_next: true, show_btn_previous: true})
        }
    }


    handleChangeArtefactos(event){
        this.setState({n_art: event.target.value});
    }


    handleChangePostprocesado(event){
        if(this.state.postprocessing === "True"){
            this.setState({postprocessing:"False"});
        }else if(this.state.postprocessing === "False"){
            this.setState({postprocessing:"True"});
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
                var id_menor_dataset = response.data[response.data.length - 1].id;
                this.setState({datasets_list: response.data,
                               id_dataset: id_menor_dataset,    
                               loading_datasets: false}, () => {this.get_meshes(id_menor_dataset)}); //
            })
        .catch(error => {
            
            console.error('An error has occurred', error);
        });
    }


    view_dataset_details(id){
        this.setState({id_details : id});
    }


    get_meshes(dataset){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        
        const url_meshes = this.props.location.state.url_base + "api_tomo/conductivities/?dataset=" + dataset +
                            "&number_artifacts="+ this.state.n_art +
                            "&index_inicio=0&index_fin=100000"; 

        axios.get(url_meshes, config)
        .then(
            response => {
                this.setState({meshes_list: response.data, loading_meshes: false});
            })
        .catch(error => {
            console.error('An error has occurred', error);
        });
    }


    filter_meshes(){
        this.setState({loading_meshes:true});
        this.get_meshes(this.state.id_dataset);
    }


    change_dataset(){
        var grupo = document.getElementsByName('datasets_list');
        var dataset = null;

        for (var i=0; i<grupo.length; i++) {
            if (grupo[i].type === 'radio' && grupo[i].checked) {
                
                dataset = grupo[i].value;
                break;
            }
        }

        this.setState({id_dataset: dataset, loading_meshes: true, initial_index: 0});
        this.get_meshes(dataset);
        
    
    }

    message_artefactos(n){
        if(n === "1"){
            return (<b>one artifact</b>);
        }else if(n === "2"){
            return (<b>two artifacts</b>);
        }else if (n === "3"){
            return (<b>three artifacts</b>);
        }

        return (<b></b>);
    }



    access_img_reconstructed(){
        var grupo = document.getElementsByName('grupo_meshes');
        var mesh = null;

        for (var i=0; i<grupo.length; i++) {
            if (grupo[i].type === 'radio' && grupo[i].checked) {
                mesh = grupo[i].value;
                break;
            }
        }

        this.setState({mesh_index: mesh, aImgRec:true});
    }



    get_date(datetime){
        var fecha = "";
        fecha = datetime.split("T")[0];
        return fecha;
    }


    render(){

        if (this.state.id_details !== null) {
            return <Redirect push to={{
                pathname: '/datasets/' + this.state.id_details,
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        if (this.state.aImgRec === true) {
            return <Redirect push to={{
                pathname: "/rec_img_reconstructed",
                state: { dataset: this.state.id_dataset,
                         mesh_index: this.state.mesh_index,
                         model: this.props.location.state.id_model,
                         postprocessing: "True",
                         token: this.props.location.state.token, url_base: this.props.location.state.url_base
                        }
            }}/>        
        }

        var index_final = this.state.initial_index + 9;
        
        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Header with_account = {true} help_message = {this.state.help_message} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <GoBackButton/>
        
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
                                                            <h3 className="card-text" >{this.props.location.state.id_model} </h3>
                                                            </div>
                                                        </div>
        
                                                        <h5 className="card-title">List of datasets </h5>
                                                        <p className="card-text">Select the dataset whose meshes you wish to examine. </p>
        
                                                            {this.state.loading_datasets === true ? (
                                                                <div className="row" id = "load">
                                                                    <div className = "col text-center">
                                                                        <div className="spinner-border text-dark loaddor" role="status">
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ):(
                                                                <table className = "table table-striped tabla_scroll_x tabla_scroll_y_20">
                                                                    <thead>
                                                                        <tr>
                                                                            <th scope="col" className = "width_col"></th>
                                                                            <th scope="col" className = "width_col">Id </th>
                                                                            <th scope="col" className = "width_col">Creator </th>
                                                                            <th scope="col" className = "width_col">Creation date </th>
                                                                            <th scope="col" className = "width_col">Number of meshes </th>
                                                                            <th scope="col" className = "width_col"></th>
                                                                        </tr>
                                                                    </thead>
        
                                                                    <tbody>
        
                                                                            {this.state.datasets_list.map( (dataset) =>
                                                                                <tr key = {dataset.id}>
                                                                                    {this.state.id_dataset === null ? (
                                                                                        <td><input type="radio" name = "datasets_list" value = {dataset.id}/></td>
        
                                                                                    ):(
                                                                                        <td><input type="radio" name = "datasets_list" value = {dataset.id} defaultChecked/></td>
        
                                                                                    )}
                                                                                    <th scope="row" >{dataset.id}</th>
        
                                                                                    <td>{dataset.creator.username}</td>
                                                                                    <td>{this.get_date(dataset.creation_date)}</td>
                                                                                    <td>{dataset.n_meshes}</td>
                                                                                    <td> <span className = "btn-link cursor_puntero" onClick = {() => this.view_dataset_details(dataset.id)}> View details</span> </td>
        
        
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
                                                                <p>No has selected ningún dataset.</p>
                                                            </div>                                
                                                        </div>
                                                        <div className = "col-md-3"></div>
                                                    </div>
                                                }
                                                <div className = "row text-center">
                                                    <div className = "col-md-12">
                                                        <button type="submit" className="btn btn-dark  mb-2" id = "btn_dataset" onClick ={() => this.change_dataset()}> 
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
                                                        <input type="button"  className="btn btn-dark  mb-2" id = "btn_filter" onClick ={() => this.filter_meshes()} value = "Filter meshes"/> 
                                                            
                                                        
                                                    </div>
                                                </div>
                                            </div>
        
                                            <hr/>
                                            <div className = "text-center"> 
                                                <h5> Apply postprocessing in the reconstruction:</h5>
                                                <br/>
                                                <label> Yes <input className = "width_3" type="radio" name = "postprocessing" id = "post_true" value = "True" onChange = {this.handleChangePostprocesado} defaultChecked /> </label>
                                                <label> No <input className = "width_3" type="radio" name = "postprocessing" id = "post_false" value = "False" onChange = {this.handleChangePostprocesado} />  </label>
                                            </div>
        
                                        </div>
                                    </div>
                                    <div className = "col-md-9">
                                        <form action="{% url 'tomo:reconstruct_image' %}" method = "post">
                                            <div className="row" >
                                                
                                                
                                                <div className="card col-md-12 caja width_14">
                                                    <div className="card-body">
                                                        <h5 className="card-title">Dataset {this.state.id_dataset}. Meshes with {this.message_artefactos(this.state.n_art)}</h5>
                                                        <p className="card-text">Select the mesh you want to reconstruct:</p>
        
                                                            {this.state.loading_meshes === true ? (
                                                                <div className="row" id = "load">
                                                                    <div className = "col text-center">
                                                                        <div className="spinner-border text-dark loaddor" role="status">
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
                                                                        {}
                                                                        <tbody>
                                                                            {this.state.meshes_list.slice(this.state.initial_index, index_final).map((m, index)=>
                                                                                <tr key = {m.index}>
                                                                                    {index === 0 ? (
                                                                                        <td><input type="radio" name="grupo_meshes" value = {m.index} defaultChecked/></td>
            
                                                                                    ):(
                                                                                        <td><input type="radio" name="grupo_meshes" value = {m.index} /></td>
                                                                                    )}
                                                                                    <th scope="row">{m.index}</th>
            
                                                                                    {m.conductivities.map((con, index) =>
                                                                                        <td key = {index}>{con}</td>
                                                                                    )} 
            
                                                                                
                                                                                        
                                                                                </tr>
                                                                            )}


                                                                            
                                                                        </tbody>

                                                                    </table>
                                                                    <input type = "hidden" id = "post_value" name = "post_value" value = ""/>
                    
                                                                    <div className="form-group row ">
                                                                        
                                                                            <div className = "col-md-6">
                                                                            {this.state.show_btn_previous === true &&
                                                                                <input type="button"  className="btn-sm btn-dark  mb-2" 
                                                                                    onClick= {() => this.modifica_index(-10)} id = "btn_anterior" value = "Previous"/> 
                                                                            }
                                                                            </div>
                                                                        
                                                                        
                                                                        <div className = "col-md-6">
                                                                            {this.state.show_btn_next === true &&
                                                                                <input type="button"  className="btn-sm btn-dark  mb-2 float-right" 
                                                                                    onClick= {() => this.modifica_index(10)} id = "btn_siguiente" value = "Next"/>
                                                                            } 
                                                                        </div>
                                                                    </div>

                                                                    <div className="form-group row text-center">
                                                                        <div className = "col-md-12">
                                                                        <input type="button"  className="btn-lg btn-dark  mb-2" 
                                                                                onClick= {() => this.access_img_reconstructed()} id = "btn_reconstruct" value = "Reconstruct image"/> 
                                                                            
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
                   <NoSession/>                                                             
                )}

            </div>
        );
    }
}

export default RecImgMeshesDatasets;
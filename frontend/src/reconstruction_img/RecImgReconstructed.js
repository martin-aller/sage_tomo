import React, { Component } from 'react'
import Header from '../management/Header';
import GoBackButton from '../management/GoBackButton';
import NoSession from '../management/NoSession'
import Loading from '../management/Loading'
import {Redirect} from "react-router-dom";


import axios from 'axios';

class RecImgReconstructed extends Component{
    //View with the images (real and predicted) reconstructed from a mesh of a dataset.

    constructor(props){
        super(props);
        this.state = {
            model: null,
            dataset: null,
            mesh_index: null,
            postprocessing: null,
            url_real: null,
            url_reconstructed: null,
            predicted_conductivities: null,
            reconstructing_img: true,
            y_cuts: 0,
            focus_cut : React.createRef(),
            url_cuts: null,
            error_model: false,
            help_message: <div><p>Two images are displayed in this window. The image on the left is the actual image associated 
                with the mesh selected in the previous window. The image on the right is the reconstructed image using the selected 
                model.</p>
                    <p>Below both images, you will find the tool to make cuts in the meshes. Using the selector provided, you can choose 
                        the value of the Y-axis of the mesh on which you want to make the cut. When you click on Analyze section, a graph 
                        will be generated and this will show the conductivity values of the mesh for the selected Y-axis value.</p></div>
          }

          this.handleChangeYCut = this.handleChangeYCut.bind(this);
          this.enfocar_cut = this.enfocar_cut.bind(this);


    }


    componentDidMount(){
        this.setState({
            model: this.props.location.state.model,
            dataset: this.props.location.state.dataset,
            mesh_index: this.props.location.state.mesh_index,
            postprocessing: this.props.location.state.postprocessing,
        });
   
        
        this.reconstruct_image(this.props.location.state.model,
                           this.props.location.state.dataset,
                           this.props.location.state.mesh_index,
                           this.props.location.state.postprocessing);
                
    }

    componentDidUpdate(){
        window.scrollTo(0,10000);
    }

    enfocar_cut(){
        var y = document.body.scrollHeight;
        y = 2*document.body.scrollHeight;
        window.scrollTo(0,y);

    }

    enfocar_cut2(){
        this.state.focus_cut.current.focus();
    }



    handleChangeYCut(event){
        var value = event.target.value;
        value = Math.max(Number(-1), Math.min(Number(1), Number(value)));
        this.setState({y_cuts: value});
    }



    reconstruct_image(model, dataset, mesh, postprocessing){

        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        axios.get(this.props.location.state.url_base + "api_tomo/reconstruct_img/?dataset=" + dataset +
                "&index=" + mesh + 
                "&model=" + model + 
                "&postprocessing=" + postprocessing, config)
        .then(
            response => {
                this.setState({reconstructing_img:false,
                                url_real: response.data.url_real,
                                url_reconstructed: response.data.url_reconstructed,
                                predicted_conductivities: response.data.predicted_conductivities,
                                });

            })
        .catch(error => {
            this.setState({error_model : true});
            console.error('Se ha producido un error al reconstruct image.', error);
        }); 

    }



    realizar_cut(conductivities, y_cort){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }


        const par = {
            dataset : this.props.location.state.dataset,
            index : this.props.location.state.mesh_index,
            y : y_cort,
            conductivities : conductivities,
        }

        axios.post(this.props.location.state.url_base + "api_tomo/generate_cut/", par, config)
        .then(
            response => {
                this.setState({
                                url_cuts: response.data.cuts,
                                });

            })
        .catch(error => {
            console.error('An error has occurred', error);
        }); 
    }



    render(){
        
        var message_model = "The selected model is not in the system anymore.";
        if (this.state.error_model === true) {
            return <Redirect push to={{
                pathname: '/without_model',
                state: { token: this.props.location.state.token, 
                        url_base: this.props.location.state.url_base,
                        message: message_model}
            }}/>        
        }

        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Header with_account = {true} help_message = {this.state.help_message} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <GoBackButton/>
        
        
                        {this.state.reconstructing_img === true ? (
                            
                            <Loading
                                completo = {true} 
                                cabecera = {"Reconstruction of mesh " + this.state.mesh_index + ". Dataset " + this.state.dataset}
                                message = "Reconstructing image. This operation may take a few seconds."
                            />
                        ):(
                            <div>
                                <h2 className = "text-center" > Reconstruction of mesh {this.state.mesh_index}. Dataset {this.state.dataset} </h2>
        
                                <br/>
                                <div className = "container text-center">
                                    <div className="row">
                                        <div className="card col-md-6 caja width_14" >
                                            <div className = "container">
                                                <h5 className="card-title text-center margin_top_1">Actual electrical conductivity values</h5>
                                                <img className="card-img-top img_rec border border-dark text-center" src={"http://" + this.state.url_real} alt="Real mesh"/>
                                            </div>
                                        </div>
        
                                        <div className="card col-md-6 caja width_14">
                                            <div className = "container">
                                                <h5 className="card-title text-center margin_top_1">Predicted electrical conductivity values</h5>
                                                <img className="card-img-top img_rec border border-dark text-center" src={"http://" + this.state.url_reconstructed} alt="Reconstructed mesh"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                
                                <br/>
                                <div  className = "container card text-center caja" id = "container_cuts" >
                                    <div className="card-body" >
                                        <h5 className="card-title text-center"> Mesh cutting</h5>
                                        {this.state.url_cuts !== null &&
                                                <img className = "border border-dark margin_bottom_1" autoFocus id = "pru" src={"http://" + this.state.url_cuts} alt = "y_cuts"/> 
                                        }  
                                        <p className="card-text">Select the value of the Y-axis to do the cutting:</p>
                                        <input type="range" name="rango_input" min="-1" max="1" step="0.1"
                                               value = {this.state.y_cuts} onChange={this.handleChangeYCut} />
                                        <input type="number" id="texto_rango" name = "y" min="-1" max="1" step="0.1" 
                                               value = {this.state.y_cuts} onChange={this.handleChangeYCut} />	
                                        <div className = "text-center">
                                            <input type="button" className="btn btn-dark mb-2 margin_top_2"  value = "Analyze section" 
                                                    onClick = {() => this.realizar_cut(this.state.predicted_conductivities, this.state.y_cuts)}/> 
                                        </div>
        
                                        <div></div>                                   
                                    </div>
        
                                </div>
                            </div>
                        )}
        
        
        
        
                    </div>
                ):(
                    <NoSession/>
                )}

            </div>
        );
    }
}



export default RecImgReconstructed;




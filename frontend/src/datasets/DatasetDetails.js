import React, { Component } from 'react'
import Header from '../management/Header';
import GoBackButton from '../management/GoBackButton';
import NoSession from '../management/NoSession'
import axios from 'axios';



class DatasetDetails extends Component{
    //View of the details of a particular dataset
    constructor(props){
        super(props);
        this.state = {
            dataset: null,
            loading: true,
            help_message: <span>This window shows all the details from the selected dataset. The seed attribute refers to the seed used to generate the artifacts. </span>
          }

    }

    componentDidMount(){
        this.get_dataset_details();
    }


    get_dataset_details(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        const id_dataset = this.props.match.params.id;
    
        axios.get(this.props.location.state.url_base + "api_tomo/datasets/" + id_dataset + "/", config)
        .then(
            response => {
                this.setState({dataset: response.data, loading: false});
            })
        .catch(error => {
            console.error('An error has occurred', error);
        });
    }

    get_date(datetime){
        var fecha = "";
        fecha = datetime.split("T")[0];
        return fecha;
    }

    render(){
        
        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Header con_cuenta = {true} help_message = {this.state.help_message} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <GoBackButton/>
        
                        {this.state.loading === true ? (
                            <div className="row" id = "load">
                                <div className = "col text-center">
                                    <div className="spinner-border text-dark loaddor" role="status">
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
                                            <td>{this.state.dataset.min_radius}</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Maximum radius of artifacts: </th>
                                            <td>{this.state.dataset.max_radius}</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Creator: </th>
                                            <td>{this.state.dataset.creator.username}</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Creation date: </th>
                                            <td>{this.get_date(this.state.dataset.creation_date)}</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Seed: </th>
                                            <td> {this.state.dataset.seed}</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Visibility: </th>
                                            {this.state.dataset.visible === true ? (
                                                <td>Public</td>
                                            ):(
                                                <td>Private</td>
                                            )}
                                        </tr>
        
                                    
                                        {this.state.dataset.n_meshes > 0 &&
                                            
                                                <tr>
                                                    <th scope="row">Total number of meshes: </th>
                                                    <td> {this.state.dataset.n_meshes}</td>
                                                </tr>
                                        }
        
                                        {this.state.dataset.n_meshes > 0 &&
                                            <tr>
                                                <th scope="row">Number of meshes with one artifact: </th>
                                                <td> {this.state.dataset.n_meshes_1} </td>
                                            </tr>
                                        }
        
                                        {this.state.dataset.n_meshes > 0 &&
                                                <tr>
                                                    <th scope="row">Number of meshes with two artifacts: </th>
                                                    <td>{this.state.dataset.n_meshes_2}</td>
                                                </tr>
                                        }                                
                                        {this.state.dataset.n_meshes > 0 &&
                                                <tr>
                                                    <th scope="row">Number of meshes with three artifacts: </th>
                                                    <td>{this.state.dataset.n_meshes_3}</td>
                                                </tr>
                                        } 
        
        
                                    </tbody>
                                    </table>
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

export default DatasetDetails;
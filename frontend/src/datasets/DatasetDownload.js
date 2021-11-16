import React, { Component } from 'react'
import Header from '../management/Header';
import GoBackButton from '../management/GoBackButton';
import NoSession from '../management/NoSession'
import Loading from '../management/Loading';
import axios from 'axios';


class DatasetDownload extends Component{
    //View for downloading a dataset.
    constructor(props){
        super(props);
        this.state = {
            preparing_download: true,
            url_download: null,

          }
    }

    componentDidMount(){
        this.prepare_download();
    }



    prepare_download(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        axios.get(this.props.location.state.url_base + "api_tomo/prepare_dataset_download/"+ this.props.match.params.id +"/", config)
        .then(
            response => {
                
                this.setState({url_download: response.data.url_dataset, preparing_download: false});
                
            })
        .catch(error => {
            console.error('An error has occurred', error);
        });
    }

    render(){
   
        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Header with_account = {true} help_message = {this.state.help_message} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <GoBackButton/>
        
                        {this.state.preparing_download === true ? (
                            <Loading
                                completo = {true} 
                                cabecera = "Dataset downloading"
                                message = "Preparing to download the dataset. This operation may take a few seconds."
                            />
                        ):(
                            <div className="card bg-light mx-auto mb-3 caja max_width_50">
                                <div className="card-header">Download for dataset {this.props.match.params.id} is ready</div>
                                <div className="card-body text-center">
                                    <h5 className="card-title">Click on <i>Download dataset</i> to start the download:</h5>
                                    <a href={"http://" + this.state.url_download} className = "btn btn-dark mb-2" download={"dataset" + this.props.match.params.id + ".csv"}>Download dataset</a>
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

export default DatasetDownload;
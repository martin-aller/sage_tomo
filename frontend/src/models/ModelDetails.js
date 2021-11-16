import React, { Component } from 'react'
import Header from '../management/Header';
import GoBackButton from '../management/GoBackButton';
import NoSession from '../management/NoSession'
import ModalMatrix from '../management/ModalMatrix';
import axios from 'axios';
import {Redirect} from "react-router-dom";



class ModelDetails extends Component{
    //View with the details of a specific model.
    
    constructor(props){
        super(props);
        this.state = {
            generic_model: false,
            specific_model: false,
            toDatasetDetails: false,
            show_matrix: false,
            loading: true,
            help_message: <div>This window displays all the details of the selected model. The dataset that appears among the 
                model attributes is the dataset used to train the model. In addition, the values of the metrics displayed are the 
                ones calculated by the test set of the mentioned dataset.</div>
          }
    }

    componentDidMount(){
        this.get_model_details();
    }

    get_model_details(){
        const config = {
            headers: {
              'Authorization': 'Token ' + this.props.location.state.token
            }
        }

        const id_model = this.props.match.params.id;
        
        axios.get(this.props.location.state.url_base + "api_tomo/models/" + id_model + "/", config)
        .then(
            response => {
                
                this.setState({generic_model: response.data.generic_model, 
                               specific_model: response.data.specific_model, 
                               loading: false});
                
                
                
            })
        .catch(error => {
            console.error('An error has occurred', error);
        });
    }


    round_num(num){
        return Math.round((num + Number.EPSILON) * 100) / 100; //Number.Epsilon para números como 1.005
    }


    access_dataset_details(){
        this.setState({toDatasetDetails:true});
    }


    setModal(state){
        this.setState({show_matrix: state});
    }

    format_datetime(datetime){
        var datetime_formatdo = "";
        datetime_formatdo = datetime.replace("T", ", ");
        datetime_formatdo = datetime_formatdo.replace("Z", "").split(".")[0];
        return datetime_formatdo;
    }

    

    render(){

        if (this.state.toDatasetDetails === true) {
            return <Redirect push to={{
                pathname: '/datasets/' + this.state.generic_model.dataset,
                state: { token: this.props.location.state.token, url_base: this.props.location.state.url_base}
            }}/>        
        }

        return(
            <div>
                {this.props.location.state !== undefined && "token" in  this.props.location.state ? (
                    <div>
                        <Header with_account = {true} help_message = {this.state.help_message} token = {this.props.location.state.token}  url_base = {this.props.location.state.url_base}/>
                        <GoBackButton/>
        
                    {this.state.show_matrix &&
                      <ModalMatrix
                      show = {this.state.show_matrix}
                      mc = {this.state.generic_model.confusion_matrix}
                      close = {() => this.setModal(false)}   
                      />       
                    }
        
                        {this.state.loading === true ? (
                            <div className="row" id = "load">
                                <div className = "col text-center">
                                    <div className="spinner-border text-dark loaddor" role="status">
                                    </div>
                                </div>
                            </div>
                        ) : (
        
                            <div className = "container">
                                <div className = "row">
                                    <div className="card col-md-6 caja" >
                                        <div className="card-body ">
                                            <h5 className="card-title"><b>General information</b> </h5>
                                             <table className = "table table-striped" >
                                                 <tbody>
                                                     <tr>
                                                         <th scope="row">Id: </th>
                                                         <td>{this.state.generic_model.id}</td>
                                                     </tr>
                                                     <tr>
                                                         <th scope="row">Type: </th>
                                                         <td>{this.state.generic_model.type}</td>
                                                     </tr>
                                                     <tr>
                                                         <th scope="row">Used dataset ID: </th>
                                                         <td>{this.state.generic_model.dataset} 
                                                             <span  className="btn-sm btn-dark float-right dataset_de_model cursor_puntero" onClick = {() => this.access_dataset_details()}>
                                                                 View information
                                                             </span>
                                                         </td>
                                                     </tr>
        
                                                     <tr>
                                                         <th scope="row">Creation date: </th>
                                                         <td>{this.format_datetime(this.state.generic_model.datetime_start)}</td>
                                                     </tr>
        
                                                     {this.state.generic_model.datetime_end !== null &&
                                                         <tr>
                                                             <th scope="row">Training time: </th>
                                                             <td>{this.state.generic_model.training_time}</td>
                                                         </tr>                                                
                                                     }
                                     
                                                     <tr>
                                                         <th scope="row">Additional comments: </th>
                                                         <td>{this.state.generic_model.comentaries}</td>
                                                     </tr>
                                                     <tr>
                                                         <th scope="row">Creator: </th>
                                                         <td>{this.state.generic_model.creator.username}</td>
                                                     </tr>
                                                     <tr>
                                                        <th scope="row">Visibility: </th>
                                                        {this.state.generic_model.visible === true ? (
                                                            <td>Public</td>
                                                        ):(
                                                            <td>Private</td>
                                                        )}
                                                    </tr>
                                                 </tbody>
                                             </table>
                                        </div>
                                    </div>
        
                                    {/*NEURAL NETWORK*/}
                                    {this.state.generic_model.type === "DNN" &&
                                        <div className="card col-md-6 caja" >
                                            <div className="card-body ">
                                              <h5 className="card-title"><b>Neural Network details</b> </h5>
                                                  <table className = "table table-striped" >
                                                        <tbody>
                                                          <tr>
                                                              <th scope="row">Number of hidden layers: </th>
                                                              <td>{this.state.specific_model.hidden_layers}</td>
                                                          </tr>
                                                          <tr>
                                                                <th scope="row">Number of neurons per hidden layer: </th>
                                                              <td>
                                                                  <ul>
                                                                      {this.state.specific_model.neurons_per_layer.map((nc, index) =>
                                                                            <li key = {index}>Hidden layer {index} &rarr; &nbsp; <b>{nc}</b></li>
                                                                      )}
        
                                                                  </ul>
                                                              </td>
                                                            </tr>
                                                          <tr>
                                                                <th scope="row">Activation function for the hidden layers: </th>
                                                              <td>{this.state.specific_model.inside_activation_function}</td>
                                                          </tr>
                                                          <tr>
                                                              <th scope="row">Activation function for the output layer: </th>
                                                              <td>{this.state.specific_model.outside_activation_function}</td>
                                                          </tr>
                                                          <tr>
                                                                <th scope="row">Error function: </th>
                                                              <td>{this.state.specific_model.error_function}</td>
                                                          </tr>
                                                          <tr>
                                                                <th scope="row">Number of epochs: </th>
                                                              <td>{this.state.specific_model.epochs}</td>
                                                          </tr>
                                                          <tr>
                                                                <th scope="row">Batch size: </th>
                                                              <td>{this.state.specific_model.batch_size}</td>
                                                          </tr>
                                                              <tr>
                                                                  <th scope="row" > Metrics: </th>
                                                                  <td>
                                                                      <ul>
                                                                          {this.state.generic_model.metrics.map((m) =>
                                                                                <li key = {m.name}> 
                                                                                    <b>{m.name}</b> : {this.round_num(m.value)}
                                                                                        {m.name === "accuracy" &&
                                                                                            <div className = "en_linea">
                                                                                                <span>%</span>
                                                                                                <p className ="btn btn-dark btn-sm" onClick = {() => this.setModal(true)}> View confusion matrix</p>                                                                   
                                                                                            </div>
        
                                                                                        }
                                                                                </li>                                                                 
                                                                          )}
                                                                      </ul>
                                                                  </td>
                                                              </tr>
                                                            <tr>
                                                                <th scope="row" > Postprocessing threshold: </th>
                                                                <td>{this.round_num(this.state.generic_model.postprocessing_threshold)}</td>
                                                            </tr>
                                                        </tbody>
                                                  </table>
                                            </div>
                                          </div>
                                    }
        
        
                                    {/*RANDOM FOREST*/}
        
                                    {this.state.generic_model.type === "RF" &&
                                        <div className="card col-md-6 caja" >
                                        <div className="card-body ">
                                            <h5 className="card-title"><b>Random Forest details</b></h5>
                                                <table className = "table table-striped" >
                                                    <tbody>
                                                        <tr>
                                                            <th scope="row">Number of estimators: </th>
                                                            <td>{this.state.specific_model.n_estimators}</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Maximum depth: </th>
                                                            <td>{this.state.specific_model.max_depth}</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Minimum number of samples to split: </th>
                                                            <td>{this.state.specific_model.min_samples_split}</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Minimum number of samples to be at a leaf node: </th>
                                                            <td>{this.state.specific_model.min_samples_leaf}</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row" > Metrics: </th>
                                                            <td>
                                                                <ul>
                                                                    {this.state.generic_model.metrics.map((m) =>
                                                                            <li key = {m.name}> 
                                                                                <b>{m.name}</b> : {this.round_num(m.value)}
                                                                                    {m.name === "accuracy" &&
                                                                                        <div className = "en_linea">
                                                                                            <span>%</span>
                                                                                            <p className ="btn btn-dark btn-sm" onClick = {() => this.setModal(true)}> View confusion matrix</p>                                                                   
                                                                                        </div>
        
                                                                                    }
                                                                            </li>                                                                 
                                                                    )}
                                                                </ul>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row" > Postprocessing threshold: </th>
                                                            <td>{this.round_num(this.state.generic_model.postprocessing_threshold)}</td>
                                                        </tr>
        
                                                    </tbody>
                                                </table>
                                        </div>
                                        </div>                            
                                    }
        
                                    {/*SUPPORT VECTOR MACHINE*/}
        
                                    {this.state.generic_model.type === "SVM" &&
                                        <div className="card col-md-6 caja" >
                                        <div className="card-body ">
                                            <h5 className="card-title"><b>Support Vector Machine details</b> </h5>
                                                <table class = "table table-striped" >
                                                    <tbody>
                                                        <tr>
                                                            <th scope="row">Kernel: </th>
                                                            <td>{this.state.specific_model.kernel}</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Degree: </th>
                                                            <td>{this.state.specific_model.degree}</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Gamma: </th>
                                                            <td>{this.state.specific_model.gamma}</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Coefficient 0: </th>
                                                            <td>{this.state.specific_model.coef0}</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Tolerance: </th>
                                                            <td>{this.state.specific_model.tol}</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">C: </th>
                                                            <td>{this.state.specific_model.c}</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">Epsilon: </th>
                                                            <td>{this.state.specific_model.epsilon}</td>
                                                        </tr>
        
                                                                <tr>                                                
                                                                    <th scope="row" > Metrics: </th>
                                                                    <td>
                                                                        <ul>
                                                                            {this.state.generic_model.metrics.map((m) =>
                                                                                    <li key = {m.name}> 
                                                                                        <b>{m.name}</b> : {this.round_num(m.value)}
                                                                                            {m.name === "accuracy" &&
                                                                                                <div className = "en_linea">
                                                                                                    <span>%</span>
                                                                                                    <p className ="btn btn-dark btn-sm" onClick = {() => this.setModal(true)}> View confusion matrix</p>                                                                   
                                                                                                </div>
                
                                                                                            }
                                                                                    </li>                                                                 
                                                                            )}
                                                                        </ul>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <th scope="row" > Postprocessing threshold: </th>
                                                                    <td>{this.round_num(this.state.generic_model.postprocessing_threshold)}</td>
                                                                </tr>
        
                                                    </tbody>
                                                </table>
                                        </div>
                                        </div>
                                
                                    }
               
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

export default ModelDetails;
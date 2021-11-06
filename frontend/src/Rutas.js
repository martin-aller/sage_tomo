import React, { Component } from 'react'
import {Switch,Route} from "react-router-dom";
import Registro from './gestion/Registro';
import Principal from './gestion/Principal';
import Cuenta from './gestion/Cuenta';
import Inicio from './gestion/Inicio';
import ExitoRegistro from './gestion/ExitoRegistro';

import Datasets from './datasets/Datasets';
import DatasetsEntrenamiento from './datasets/DatasetsEntrenamiento';
import DatasetDetalles from './datasets/DatasetDetalles';
import DatasetGenerar from './datasets/DatasetGenerar';
import DatasetSubir from './datasets/DatasetSubir';
import DatasetDescargar from './datasets/DatasetDescargar';


import ObjetoEliminado from './gestion/ObjetoEliminado';
import ObjetoDescartado from './gestion/ObjetoDescartado';
import SinModelo from './gestion/SinModelo';


import Modelos from './modelos/Modelos';
import ModeloDetalles from './modelos/ModeloDetalles';
import ModelosDefinirComparacion from './modelos/ModelosDefinirComparacion';
import ModelosTipos from './modelos/ModelosTipos';
import ModelosComparacionRealizada from './modelos/ModelosComparacionRealizada';
import ModelosRecImg from './modelos/ModelosRecImg';
import EntrenarDNN from './modelos/EntrenarDNN';
import EntrenarRF from './modelos/EntrenarRF';
import EntrenarSVM from './modelos/EntrenarSVM';


import Tareas from './tareas/Tareas';
import TareasModelos from './tareas/TareasModelos';
import TareasDatasets from './tareas/TareasDatasets';



import RecImgTipos from './reconstruccion_img/RecImgTipos';
import RecImgMallasDatasets from './reconstruccion_img/RecImgMallasDatasets';
import RecImgReconstruida from './reconstruccion_img/RecImgReconstruida';
import RecImgSubirVoltajes from './reconstruccion_img/RecImgSubirVoltajes';
import RecImgPrediccionRealizada from './reconstruccion_img/RecImgPrediccionRealizada';

//En esta vista se definen las URLs de la aplicación.

class Rutas extends Component{
    render(){
        return(
            <Switch>

                <Route  path="/rec_img_tipos" render={(props) => <RecImgTipos {...props}/>}/>
                <Route  path="/rec_img_mallas_datasets"  render={(props) => <RecImgMallasDatasets {...props}/>} />
                <Route  path="/rec_img_reconstruida" render={(props) => <RecImgReconstruida {...props}/>}/>
                <Route  path="/rec_img_subir_voltajes" render={(props) => <RecImgSubirVoltajes {...props}/>}/>
                <Route  path="/rec_img_prediccion_realizada" render={(props) => <RecImgPrediccionRealizada {...props}/>}/>


                <Route  path="/modelos/:id" render={(props) => <ModeloDetalles {...props}/>} />
                <Route  path="/modelos" render={(props) => <Modelos {...props}/>} />
                <Route  path="/modelos_rec_img" render={(props) => <ModelosRecImg {...props}/>} />
                <Route  path="/modelos_definir_comparacion" render={(props) => <ModelosDefinirComparacion {...props}/>}/>
                <Route  path="/modelos_comparacion_realizada" render={(props) => <ModelosComparacionRealizada {...props}/>}/>


                <Route  path="/tipos_modelos" render={(props) => <ModelosTipos {...props}/>} />
                <Route  path="/entrenar_dnn" render={(props) => <EntrenarDNN {...props}/>}/>
                <Route  path="/entrenar_rf" render={(props) => <EntrenarRF {...props}/>}/>
                <Route  path="/entrenar_svm" render={(props) => <EntrenarSVM {...props}/>}/>


                <Route  path="/datasets/:id" render={(props) => <DatasetDetalles {...props}/>} />
                <Route  path="/datasets" render={(props) => <Datasets {...props}/>} />
                <Route  path="/datasets_entrenamiento" render={(props) => <DatasetsEntrenamiento {...props}/>} />
                <Route  path="/dataset_generar" render={(props) => <DatasetGenerar {...props}/>} />
                <Route  path="/dataset_subir" render={(props) => <DatasetSubir {...props}/>} />
                <Route  path="/dataset_descargar/:id" render={(props) => <DatasetDescargar {...props}/>} />
                
                {/* <Route  path="/registro" component = {Registro}/> */}
                <Route  path="/registro" render={(props) => <Registro {...props}/>}/>
                <Route  path="/exito_registro" render={(props) => <ExitoRegistro {...props}/>} />
                <Route  path="/principal" render={(props) => <Principal {...props}/>}/>
                <Route  path="/cuenta" render={(props) => <Cuenta {...props}/>}/>


                <Route  path="/objeto_eliminado" render={(props) => <ObjetoEliminado {...props}/>}/>
                <Route  path="/objeto_descartado" render={(props) => <ObjetoDescartado {...props}/>}/>
                <Route  path="/sin_modelo" render={(props) => <SinModelo {...props}/>}/>


                <Route  path="/tareas" render={(props) => <Tareas {...props}/>} />
                <Route  path="/tareas_modelos" render={(props) => <TareasModelos {...props}/>} />
                <Route  path="/tareas_datasets" render={(props) => <TareasDatasets {...props}/>} />

                <Route  path="/" exact component = {Inicio}/>





             </Switch>
        );
    }
}

export default Rutas;
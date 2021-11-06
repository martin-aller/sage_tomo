import React, { Component } from 'react'
import { Button, Modal, Table } from "react-bootstrap";




class ModalMatriz extends Component{
    //Componente modal para mostrar matrices de confusión.

    calcula_porcentaje(num){
        const mc = this.props.mc;
        const total = mc.verdaderos_positivos + mc.verdaderos_negativos + mc.falsos_positivos + mc.falsos_negativos;
        const porcentaje = (num/total)*100;
        const porcentaje_redondo = Math.round((porcentaje + Number.EPSILON) * 100) / 100;
        return porcentaje_redondo;
    }

    render(){
        return (
        <Modal
            show = {this.props.show}

            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header  className = "bg-dark letras_blancas" >
                <Modal.Title id="contained-modal-title-vcenter">
                    Confusion matrix
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className = "bg-dark">
                
                <Table striped bordered hover>
                    <thead className = "letras_blancas">
                        <tr>
                            <th className="tg-0lax" colspan="2" rowspan="2"></th>
                            <th className="tg-0pky" colspan="2">Actual value</th>
                        </tr>
                        <tr>
                            <td className="tg-0pky">Without artifact</td>
                            <td className="tg-0lax">With artifact</td>
                        </tr>
                    </thead>
                    <tbody className = "letras_blancas">
                        <tr>
                            <th className="tg-0lax" rowspan="2">Prediction</th>
                            <td className="tg-0pky">Without artifact</td>
                            <td className="tg-0pky"> {this.props.mc.verdaderos_negativos} ({this.calcula_porcentaje(this.props.mc.verdaderos_negativos)}%) </td>
                            <td className="tg-0lax"> {this.props.mc.falsos_negativos} ({this.calcula_porcentaje(this.props.mc.falsos_negativos)}%) </td>
                        </tr>
                        <tr>
                            <td className="tg-0pky">With artifact</td>
                            <td className="tg-0pky"> {this.props.mc.falsos_positivos} ({this.calcula_porcentaje(this.props.mc.falsos_positivos)}%)</td>
                            <td className="tg-0lax"> {this.props.mc.verdaderos_positivos} ({this.calcula_porcentaje(this.props.mc.verdaderos_positivos)}%)</td>
                        </tr>
                    </tbody>

                </Table>
            
            </Modal.Body>
            <Modal.Footer className = "bg-dark">
                <Button  variant = "secondary" onClick = {this.props.cerrar}> Close</Button>
            </Modal.Footer>

        </Modal>
        
        );
        }
  }


export default ModalMatriz;
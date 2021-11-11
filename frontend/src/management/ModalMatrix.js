import React, { Component } from 'react'
import { Button, Modal, Table } from "react-bootstrap";




class ModalMatrix extends Component{
    //Modal component to display confusion matrices.

    calculate_percentage(num){
        const mc = this.props.mc;
        const total = mc.true_positives + mc.true_negatives + mc.false_positives + mc.false_negatives;
        const percentage = (num/total)*100;
        const percentage_rounded = Math.round((percentage + Number.EPSILON) * 100) / 100;
        return percentage_rounded;
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
                            <td className="tg-0pky"> {this.props.mc.true_negatives} ({this.calculate_percentage(this.props.mc.true_negatives)}%) </td>
                            <td className="tg-0lax"> {this.props.mc.false_negatives} ({this.calculate_percentage(this.props.mc.false_negatives)}%) </td>
                        </tr>
                        <tr>
                            <td className="tg-0pky">With artifact</td>
                            <td className="tg-0pky"> {this.props.mc.false_positives} ({this.calculate_percentage(this.props.mc.false_positives)}%)</td>
                            <td className="tg-0lax"> {this.props.mc.true_positives} ({this.calculate_percentage(this.props.mc.true_positives)}%)</td>
                        </tr>
                    </tbody>

                </Table>
            
            </Modal.Body>
            <Modal.Footer className = "bg-dark">
                <Button  variant = "secondary" onClick = {this.props.close}> Close</Button>
            </Modal.Footer>

        </Modal>
        
        );
        }
  }


export default ModalMatrix;
import React, { Component } from 'react'
import { Button, Modal } from "react-bootstrap";




class ModalHelp extends Component{
    //Modal component to display help messages.

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
                    {this.props.cabecera}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className = "bg-dark letras_blancas">
                <div>
                    {this.props.message}
                </div>
            </Modal.Body>
            <Modal.Footer className = "bg-dark">
                <Button className = "width_6" variant = "secondary" onClick = {this.props.close}>Close</Button>
            </Modal.Footer>

        </Modal>
        
        );
        }
  }


export default ModalHelp;
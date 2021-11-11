import React, { Component } from 'react'
import { Button, Modal } from "react-bootstrap";




class ModalYesNo extends Component{
    //Modal component to accept or reject an option.

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
            <p>
                {this.props.message}
            </p>
            </Modal.Body>
            <Modal.Footer className = "bg-dark">
            <Button className = "mr-auto width_6" variant = "success" onClick = {this.props.si}> Yes</Button>
            <Button className = "width_6" variant = "danger" onClick = {this.props.no}>No</Button>
            </Modal.Footer>

        </Modal>
        
        );
        }
  }


export default ModalYesNo;
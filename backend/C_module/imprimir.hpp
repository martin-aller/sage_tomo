#ifndef IMPRIMIR_HPP
#define IMPRIMIR_HPP

#include "element.hpp"

namespace sp1 {
    void imprimirPuntos(const sp1::Vect_Points &vp);

    void imprimirElementos(const sp1::Vect_Elements &ve);

    void imprimirPuntos_Elemento(const sp1::Element &e);

    void imprimirPermeabilidades(const sp1::Vect_Elements &ve);

    void imprimirBaricentrosPermeabilidades(const sp1::Vect_Elements &ve);
}

#endif // IMPRIMIR_HPP

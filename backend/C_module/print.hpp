#ifndef IMPRIMIR_HPP
#define IMPRIMIR_HPP

#include "element.hpp"

namespace sp1 {
    void printPoints(const sp1::Vect_Points &vp);

    void printElements(const sp1::Vect_Elements &ve);

    void printPoints_Elemento(const sp1::Element &e);

    void printPermeabilities(const sp1::Vect_Elements &ve);

    void printBaricentrosPermeabilities(const sp1::Vect_Elements &ve);
}

#endif // IMPRIMIR_HPP

#ifndef FUNCIONES_HPP
#define FUNCIONES_HPP

#include "element.hpp"

namespace sp1 {
    float distanciaPuntos(const sp1::Point &p1, const sp1::Point &p2);

    void restaurarPermeabilidades(sp1::Vect_Elements &ve);

    void reactivarElementos(sp1::Vect_Elements &ve);

    void changeConductivityElementos(int num_elemento, int profundidad, float permeabilidad1, float permeabilidad2,
            sp1::Vect_Elements &ve);
}

#endif //FUNCIONES_HPP

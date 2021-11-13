#ifndef FUNCIONES_HPP
#define FUNCIONES_HPP

#include "element.hpp"

namespace sp1 {
    float distancePoints(const sp1::Point &p1, const sp1::Point &p2);

    void restorePermeabilities(sp1::Vect_Elements &ve);

    void reactivateElements(sp1::Vect_Elements &ve);

    void changeConductivityElements(int num_element, int depth, float permeability1, float permeability2,
            sp1::Vect_Elements &ve);
}

#endif //FUNCIONES_HPP

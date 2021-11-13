#ifndef GESTIONARFICHERO_HPP
#define GESTIONARFICHERO_HPP

#include <string>
#include "element.hpp"

namespace sp1 {

    enum Codigo {
        OK, ERROR_ABRIENDO_FICHERO, ERROR_FORMATO
    };

    void readFile(const std::string &rutaFile, sp1::Vect_Points &vp, sp1::Vect_Elements &ve, Codigo &codigo);

    void escribirFile(const std::string &in, const std::string &out, sp1::Vect_Elements &ve, Codigo &codigo);
}

#endif //GESTIONARFICHERO_HPP

#include "point.hpp"

namespace sp1 {

    Point::Point() : x(0), y(0) {
        elementos_punto_comun = new Vect_Punt_Elements();
    }

    Point::Point(float x, float y) : x(x), y(y) {
        elementos_punto_comun = new Vect_Punt_Elements();
    }

    float Point::get_x() const {
        return x;
    }

    float Point::get_y() const {
        return y;
    }

    void Point::addElemento(Element *e) {
        elementos_punto_comun->push_back(e);
    }

    Vect_Punt_Elements *Point::getElementos() {
        return elementos_punto_comun;
    }

}
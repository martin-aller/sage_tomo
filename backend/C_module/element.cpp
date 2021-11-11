#include "element.hpp"

namespace {

    void calcularBaricentro(const sp1::Point *p1, const sp1::Point *p2, const sp1::Point *p3, sp1::Point &b) {
        float x, y;

        x = (p1->get_x() + p2->get_x() + p3->get_x()) / 3;
        y = (p1->get_y() + p2->get_y() + p3->get_y()) / 3;

        b = sp1::Point(x, y);
    }
}

namespace sp1 {

    Element::Element(Point *point1, Point *point2, Point *point3) : p1(point1), p2(point2), p3(point3),
    permeabilidad(1), activo(true) {
        calcularBaricentro(p1, p2, p3, baricentro);
    }

    Point *Element::get_p1() const {
        return p1;
    }

    Point *Element::get_p2() const {
        return p2;
    }

    Point *Element::get_p3() const {
        return p3;
    }

    void Element::get_baricentro(Point &out) const {
        out = baricentro;
    }

    void Element::set_permeabilidad(float p) {
        if (p > permeabilidad) {
            permeabilidad = p;
            desactivar();
        }
    }

    float Element::get_permeabilidad() const {
        return permeabilidad;
    }

    void Element::resturarPermeabilidad() {
        permeabilidad = 1.0;
    }

    void Element::desactivar() {
        activo = false;
    }

    void Element::activar() {
        activo = true;
    }

    bool Element::get_state() const {
        return activo;
    }

}

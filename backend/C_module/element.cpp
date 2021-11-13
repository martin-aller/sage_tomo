#include "element.hpp"
#include <iostream>
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
    permeability(1), enable(true) {
        calcularBaricentro(p1, p2, p3, barycenter);
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

    void Element::get_barycenter(Point &out) const {
        out = barycenter;
    }

    void Element::set_permeability(float p) {
        using namespace std;
                
        if (p > permeability) {
            permeability = p;
            deactivate();
            
        }
        
    }

    float Element::get_permeability() const {
        return permeability;
    }

    void Element::restorePermeability() {
        permeability = 1.0;
    }

    void Element::deactivate() {
        enable = false;
    }

    void Element::activate() {
        enable = true;
    }

    bool Element::get_state() const {
        return enable;
    }

}

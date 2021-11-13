#include "print.hpp"
#include <iostream>

namespace sp1 {

    void printPoints(const sp1::Vect_Points &vp) {
        for (int i = 0; i < vp.size(); i++) {
            std::cout << vp[i].get_x() << " " << vp[i].get_y() << std::endl;
        }
    }

    void printElements(const sp1::Vect_Elements &ve) {
        for (int i = 0; i < ve.size(); i++) {
            std::cout << "(" << ve[i].get_p1()->get_x() << ", " << ve[i].get_p1()->get_y() << ")  ";
            std::cout << "(" << ve[i].get_p2()->get_x() << ", " << ve[i].get_p2()->get_y() << ")  ";
            std::cout << "(" << ve[i].get_p3()->get_x() << ", " << ve[i].get_p3()->get_y() << ")" << std::endl;
        }
    }

    void printPoints_Elemento(const sp1::Element &e) {
        std::cout << e.get_p1()->get_x() << " ";
        std::cout << e.get_p1()->get_y() << std::endl;

        std::cout << e.get_p2()->get_x() << " ";
        std::cout << e.get_p2()->get_y() << std::endl;

        std::cout << e.get_p3()->get_x() << " ";
        std::cout << e.get_p3()->get_y() << std::endl << std::endl;
    }

    void printPermeabilities(const sp1::Vect_Elements &ve) {
        for (int i = 0; i < ve.size(); i++) {
            std::cout << ve[i].get_permeability() << ' ';
        }
    }

    void printBaricentrosPermeabilities(const sp1::Vect_Elements &ve) {
        Point p;
        for (int i = 0; i < ve.size(); i++) {
            ve[i].get_barycenter(p);
            std::cout << p.get_x() << ";" << p.get_y() << ";" << ve[i].get_permeability() << std::endl;
        }
    }
}

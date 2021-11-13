#ifndef ELEMENT_HPP
#define ELEMENT_HPP

#include "point.hpp"

namespace sp1 {
    class Point;

    class Element {
    public:
        Element(Point *point1, Point *point2, Point *point3);

        Point *get_p1() const;

        Point *get_p2() const;

        Point *get_p3() const;

        void get_barycenter(Point &out) const;

        void set_permeability(float p);

        float get_permeability() const;

        void restorePermeability();

        void deactivate();

        void activate();

        bool get_state() const;

    private:
        Point *p1;
        Point *p2;
        Point *p3;
        Point barycenter;
        float permeability;
        bool enable;
    };

    typedef std::vector<Element> Vect_Elements;

}

#endif //ELEMENT_HPP

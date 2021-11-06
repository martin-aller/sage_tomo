#ifndef POINT_HPP
#define POINT_HPP

#include <vector>
#include <set>

namespace sp1 {
    class Element;

    typedef std::vector<Element *> Vect_Punt_Elements;
    typedef std::set<Element *> Set_Punt_Elements;

    class Point {
    public:
        Point();

        Point(float x, float y);

        float get_x() const;

        float get_y() const;

        void addElemento(Element *e);

        Vect_Punt_Elements *getElementos();

    private:
        float x;
        float y;
        Vect_Punt_Elements *elementos_punto_comun;
    };

    typedef std::vector<Point> Vect_Points;
}

#endif //POINT_HPP

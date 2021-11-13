#include "functions.hpp"
#include <algorithm>
#include <cmath>
#include <iostream>
#include <string>  
namespace {

    void getDirectNeighbors(sp1::Element *e, sp1::Vect_Punt_Elements &out) {
        sp1::Point *p1 = e->get_p1();
        sp1::Point *p2 = e->get_p2();
        sp1::Point *p3 = e->get_p3();

        sp1::Vect_Punt_Elements *elemts_p1 = p1->getElements();
        sp1::Vect_Punt_Elements *elemts_p2 = p2->getElements();
        sp1::Vect_Punt_Elements *elemts_p3 = p3->getElements();

        // p1 -> p2, p3
        for (int i = 0; i < elemts_p1->size(); i++) {
            sp1::Element *current = (*elemts_p1)[i];

            if (e == current) {
                continue;
            }

            if (std::find(elemts_p2->begin(), elemts_p2->end(), current) != elemts_p2->end()) {
                if (std::find(out.begin(), out.end(), current) == out.end()) {
                    if (current->get_state()) {
                        out.push_back(current);
                    }
                }
            }

            if (std::find(elemts_p3->begin(), elemts_p3->end(), current) != elemts_p3->end()) {
                if (std::find(out.begin(), out.end(), current) == out.end()) {
                    if (current->get_state()) {
                        out.push_back(current);
                    }
                }
            }
        }

        // p2 -> p3
        for (int i = 0; i < elemts_p2->size(); i++) {
            sp1::Element *current = (*elemts_p2)[i];

            if (e == current) {
                continue;
            }

            if (std::find(elemts_p3->begin(), elemts_p3->end(), current) != elemts_p3->end()) {
                if (std::find(out.begin(), out.end(), current) == out.end()) {
                    if (current->get_state()) {
                        out.push_back(current);
                    }
                }
            }
        }
    }

    void getNeighbors(sp1::Element *e, sp1::Set_Punt_Elements &out) {
        sp1::Point *p1 = e->get_p1();
        sp1::Point *p2 = e->get_p2();
        sp1::Point *p3 = e->get_p3();

        sp1::Vect_Punt_Elements *elemts_p1 = p1->getElements();
        sp1::Vect_Punt_Elements *elemts_p2 = p2->getElements();
        sp1::Vect_Punt_Elements *elemts_p3 = p3->getElements();

        for (int i = 0; i < elemts_p1->size(); i++) {
            if ((*elemts_p1)[i]->get_state()) {
                out.insert((*elemts_p1)[i]);
            }
        }
        for (int i = 0; i < elemts_p2->size(); i++) {
            if ((*elemts_p2)[i]->get_state()) {
                out.insert((*elemts_p2)[i]);
            }
        }
        for (int i = 0; i < elemts_p3->size(); i++) {
            if ((*elemts_p3)[i]->get_state()) {
                out.insert((*elemts_p3)[i]);

            }
        }
    }

    void getListNeighbors(sp1::Set_Punt_Elements &listNeighbors) {
        sp1::Set_Punt_Elements temp;
        for (sp1::Element* v : listNeighbors) {
            temp.insert(v);
        }

        listNeighbors.clear();

        for (sp1::Element* v : temp) {
            getNeighbors(v, listNeighbors);
        }
    }

    sp1::Point *getNotSharedPoint(sp1::Element *e1, sp1::Element *e2) {
        sp1::Point *deactivate = nullptr, *test;

        test = e1->get_p1();
        if (test != e2->get_p1()) {
            deactivate = e1->get_p1();
        } else if (test != e2->get_p2()) {
            deactivate = e1->get_p2();
        } else {
            deactivate = e1->get_p3();
        }

        if (deactivate == nullptr) {
            test = e1->get_p2();
            if (test != e2->get_p1()) {
                deactivate = e1->get_p1();
            } else if (test != e2->get_p2()) {
                deactivate = e1->get_p2();
            } else {
                deactivate = e1->get_p3();
            }
        }

        if (deactivate == nullptr) {
            test = e1->get_p3();
            if (test != e2->get_p1()) {
                deactivate = e1->get_p1();
            } else if (test != e2->get_p2()) {
                deactivate = e1->get_p2();
            } else {
                deactivate = e1->get_p3();
            }
        }

        return deactivate;
    }
}

namespace sp1 {

    float distancePoints(const sp1::Point &p1, const sp1::Point &p2) {
        return float(sqrt(pow((p2.get_x() - p1.get_x()), 2) + pow(p2.get_y() - p1.get_y(), 2)));
    }

    void restorePermeabilities(sp1::Vect_Elements &ve) {
        for (int i = 0; i < ve.size(); i++) {
            ve[i].restorePermeability();
        }
    }

    void reactivateElements(sp1::Vect_Elements &ve) {
        for (int i = 0; i < ve.size(); i++) {
            ve[i].activate();
        }
    }

    void changeConductivityElements(int num_element, int depth, float permeability1, float permeability2,
            sp1::Vect_Elements &ve) {
                using namespace std;
        if (permeability2 > permeability1) {
            float temp = permeability1;
            permeability1 = permeability2;
            permeability2 = temp;
        }

        Element *e = &ve[num_element - 1];
        sp1::Set_Punt_Elements listNeighbors;
        listNeighbors.insert(e);

        float reducir = (permeability1 - permeability2) / depth;
        float nuevaPermeability = permeability1 + reducir;

        int numero_capas_degradado = std::ceil(depth * 0.2);

        
        while (depth > 0) {


            //Maximum permeability in 80% of the artifact
            if (depth <= numero_capas_degradado) {
                nuevaPermeability = permeability1 - ((permeability1 - permeability2) / (numero_capas_degradado + 1)) * (numero_capas_degradado - depth + 1);
            } else {
                nuevaPermeability = permeability1;
            }
            
            for (Element* v : listNeighbors) {                
                v->set_permeability(nuevaPermeability);
            }
            
            getListNeighbors(listNeighbors);
            
            depth--;
        }
    }
}

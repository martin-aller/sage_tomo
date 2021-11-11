#include "funciones.hpp"
#include <algorithm>
#include <cmath>

namespace {

    void obtenerVecinos_directos(sp1::Element *e, sp1::Vect_Punt_Elements &out) {
        sp1::Point *p1 = e->get_p1();
        sp1::Point *p2 = e->get_p2();
        sp1::Point *p3 = e->get_p3();

        sp1::Vect_Punt_Elements *elemts_p1 = p1->getElementos();
        sp1::Vect_Punt_Elements *elemts_p2 = p2->getElementos();
        sp1::Vect_Punt_Elements *elemts_p3 = p3->getElementos();

        // p1 -> p2, p3
        for (int i = 0; i < elemts_p1->size(); i++) {
            sp1::Element *actual = (*elemts_p1)[i];

            if (e == actual) {
                continue;
            }

            if (std::find(elemts_p2->begin(), elemts_p2->end(), actual) != elemts_p2->end()) {
                if (std::find(out.begin(), out.end(), actual) == out.end()) {
                    if (actual->get_state()) {
                        out.push_back(actual);
                    }
                }
            }

            if (std::find(elemts_p3->begin(), elemts_p3->end(), actual) != elemts_p3->end()) {
                if (std::find(out.begin(), out.end(), actual) == out.end()) {
                    if (actual->get_state()) {
                        out.push_back(actual);
                    }
                }
            }
        }

        // p2 -> p3
        for (int i = 0; i < elemts_p2->size(); i++) {
            sp1::Element *actual = (*elemts_p2)[i];

            if (e == actual) {
                continue;
            }

            if (std::find(elemts_p3->begin(), elemts_p3->end(), actual) != elemts_p3->end()) {
                if (std::find(out.begin(), out.end(), actual) == out.end()) {
                    if (actual->get_state()) {
                        out.push_back(actual);
                    }
                }
            }
        }
    }

    void obtenerVecinos(sp1::Element *e, sp1::Set_Punt_Elements &out) {
        sp1::Point *p1 = e->get_p1();
        sp1::Point *p2 = e->get_p2();
        sp1::Point *p3 = e->get_p3();

        sp1::Vect_Punt_Elements *elemts_p1 = p1->getElementos();
        sp1::Vect_Punt_Elements *elemts_p2 = p2->getElementos();
        sp1::Vect_Punt_Elements *elemts_p3 = p3->getElementos();

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

    void obtenerListaVecinos(sp1::Set_Punt_Elements &listVecinos) {
        sp1::Set_Punt_Elements temp;
        for (sp1::Element* v : listVecinos) {
            temp.insert(v);
        }

        listVecinos.clear();

        for (sp1::Element* v : temp) {
            obtenerVecinos(v, listVecinos);
        }
    }

    sp1::Point *getPuntoNoComun(sp1::Element *e1, sp1::Element *e2) {
        sp1::Point *desactivar = nullptr, *test;

        test = e1->get_p1();
        if (test != e2->get_p1()) {
            desactivar = e1->get_p1();
        } else if (test != e2->get_p2()) {
            desactivar = e1->get_p2();
        } else {
            desactivar = e1->get_p3();
        }

        if (desactivar == nullptr) {
            test = e1->get_p2();
            if (test != e2->get_p1()) {
                desactivar = e1->get_p1();
            } else if (test != e2->get_p2()) {
                desactivar = e1->get_p2();
            } else {
                desactivar = e1->get_p3();
            }
        }

        if (desactivar == nullptr) {
            test = e1->get_p3();
            if (test != e2->get_p1()) {
                desactivar = e1->get_p1();
            } else if (test != e2->get_p2()) {
                desactivar = e1->get_p2();
            } else {
                desactivar = e1->get_p3();
            }
        }

        return desactivar;
    }
}

namespace sp1 {

    float distanciaPuntos(const sp1::Point &p1, const sp1::Point &p2) {
        return float(sqrt(pow((p2.get_x() - p1.get_x()), 2) + pow(p2.get_y() - p1.get_y(), 2)));
    }

    void restaurarPermeabilidades(sp1::Vect_Elements &ve) {
        for (int i = 0; i < ve.size(); i++) {
            ve[i].resturarPermeabilidad();
        }
    }

    void reactivarElementos(sp1::Vect_Elements &ve) {
        for (int i = 0; i < ve.size(); i++) {
            ve[i].activar();
        }
    }

    void changeConductivityElementos(int num_elemento, int profundidad, float permeabilidad1, float permeabilidad2,
            sp1::Vect_Elements &ve) {
        if (permeabilidad2 > permeabilidad1) {
            float temp = permeabilidad1;
            permeabilidad1 = permeabilidad2;
            permeabilidad2 = temp;
        }

        Element *e = &ve[num_elemento - 1];
        sp1::Set_Punt_Elements listVecinos;
        listVecinos.insert(e);

        float reducir = (permeabilidad1 - permeabilidad2) / profundidad;
        float nuevaPermeabilidad = permeabilidad1 + reducir;

        int numero_capas_degradado = std::ceil(profundidad * 0.2);

        while (profundidad > 0) {
            // Reducción de la permeabilidad de forma lineal
            //nuevaPermeabilidad -= reducir;

            // Máxima permeabilidad en el 80% del artefacto
            if (profundidad <= numero_capas_degradado) {
                nuevaPermeabilidad = permeabilidad1 - ((permeabilidad1 - permeabilidad2) / (numero_capas_degradado + 1)) * (numero_capas_degradado - profundidad + 1);
            } else {
                nuevaPermeabilidad = permeabilidad1;
            }

            for (Element* v : listVecinos) {
                v->set_permeabilidad(nuevaPermeabilidad);
            }

            obtenerListaVecinos(listVecinos);

            profundidad--;
        }
    }
}

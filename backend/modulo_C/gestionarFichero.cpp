#include <iostream>
#include <fstream>
#include "gestionarFichero.hpp"

namespace {

    void leerDimensiones(std::ifstream &fichero, int &rows) {
        // Saltar línea '# type: matrix'
        fichero.ignore(512, '\n');

        fichero.ignore(512, ':');
        fichero >> rows;

        // Saltar el '\n'
        fichero.ignore(512, '\n');

        // Saltar línea '# columns: 2'
        fichero.ignore(512, '\n');
    }

    void leerPuntos(std::ifstream &fichero, sp1::Vect_Points &vp, sp1::Codigo &codigo) {
        float x, y;
        int rows;

        leerDimensiones(fichero, rows);

        vp.reserve(rows);

        int i = 0;
        do {
            fichero >> x >> y;
            fichero >> std::ws;

            sp1::Point p(x, y);
            vp.push_back(p);

            ++i;
        } while (i < rows && !fichero.fail());

        if (i != rows || fichero.fail()) {
            codigo = sp1::ERROR_FORMATO;
        }
    }

    void leerElementos(std::ifstream &fichero, sp1::Vect_Elements &ve, sp1::Vect_Points &vp, sp1::Codigo &codigo) {
        int num1, num2, num3;
        int rows;

        leerDimensiones(fichero, rows);

        ve.reserve(rows);

        int i = 0;
        do {
            fichero >> num1 >> num2 >> num3;
            fichero >> std::ws;

            sp1::Element e(&vp[num1 - 1], &vp[num2 - 1], &vp[num3 - 1]);
            ve.push_back(e);

            vp[num1 - 1].addElemento(&ve.back());
            vp[num2 - 1].addElemento(&ve.back());
            vp[num3 - 1].addElemento(&ve.back());

            ++i;
        } while (i < rows && !fichero.fail());

        if (i != rows || fichero.fail()) {
            codigo = sp1::ERROR_FORMATO;
        }
    }

    void leerPermeabilidades(std::ifstream &fichero, sp1::Vect_Elements &ve, sp1::Codigo &codigo) {
        float temp;
        int rows;

        leerDimensiones(fichero, rows);

        int i = 0;
        do {
            fichero >> temp;
            fichero >> std::ws;

            ve[i].set_permeabilidad(temp);
            ++i;
        } while (i < rows && !fichero.fail());

        if (i != rows || fichero.fail()) {
            codigo = sp1::ERROR_FORMATO;
        }
    }
}

namespace sp1 {

    void
    leerFichero(const std::string &rutaFichero, sp1::Vect_Points &vp, sp1::Vect_Elements &ve, sp1::Codigo &codigo) {
        std::ifstream fichero(rutaFichero.c_str());

        if (fichero.fail()) {
            codigo = ERROR_ABRIENDO_FICHERO;
        } else {
            std::string linea;

            // Leer nodos/puntos
            do {
                fichero >> std::ws;
                getline(fichero, linea);
            } while (linea != "# name: nodes" && !fichero.fail() && !fichero.eof());

            if (fichero.fail() || fichero.eof()) {
                codigo = ERROR_FORMATO;
                return;
            }

            leerPuntos(fichero, vp, codigo);
            if (codigo == ERROR_FORMATO) {
                return;
            }


            // Leer elementos
            do {
                fichero >> std::ws;
                getline(fichero, linea);
            } while (linea != "# name: elems" && !fichero.fail() && !fichero.eof());

            if (fichero.fail() || fichero.eof()) {
                codigo = ERROR_FORMATO;
                return;
            }

            leerElementos(fichero, ve, vp, codigo);
            if (codigo == ERROR_FORMATO) {
                return;
            }


            // Leer permeabilidades
            do {
                fichero >> std::ws;
                getline(fichero, linea);
            } while (linea != "# name: elem_data" && !fichero.fail() && !fichero.eof());


            if (fichero.fail() || fichero.eof()) {
                codigo = ERROR_FORMATO;
                return;
            }

            leerPermeabilidades(fichero, ve, codigo);
            if (codigo == ERROR_FORMATO) {
                return;
            }


            codigo = OK;
            fichero.close();
        }
    }

    void escribirFichero(const std::string &in, const std::string &out, sp1::Vect_Elements &ve, Codigo &codigo) {
        std::ifstream original(in.c_str());
        std::ofstream nuevo(out.c_str());

        if (original.fail() || nuevo.fail()) {
            codigo = ERROR_ABRIENDO_FICHERO;
        } else {
            std::string linea;


            do {
                getline(original, linea);
                nuevo << linea << std::endl;
                if (linea == "# name: elem_data") {
                    break;
                }
            } while (linea != "# name: elem_data" && !original.fail() && !original.eof());

            // # type: matrix
            getline(original, linea);
            nuevo << linea << std::endl;

            // # rows: x
            getline(original, linea);
            nuevo << linea << std::endl;

            // # columns: 1
            getline(original, linea);
            nuevo << linea << std::endl;

            if (original.fail() || original.eof()) {
                codigo = ERROR_FORMATO;
                return;
            }

            for (int i = 0; i < ve.size(); i++) {
                nuevo << ve[i].get_permeabilidad() << std::endl;
            }

            codigo = OK;
            original.close();
            nuevo.close();
        }
    }
}

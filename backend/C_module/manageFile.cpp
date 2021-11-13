#include <iostream>
#include <fstream>
#include "manageFile.hpp"
#include <string>  
namespace {

    void readDimensiones(std::ifstream &file, int &rows) {
        // Saltar línea '# type: matrix'
        file.ignore(512, '\n');

        file.ignore(512, ':');
        file >> rows;

        // Saltar el '\n'
        file.ignore(512, '\n');

        // Saltar línea '# columns: 2'
        file.ignore(512, '\n');
    }

    void readPoints(std::ifstream &file, sp1::Vect_Points &vp, sp1::Codigo &codigo) {
        float x, y;
        int rows;

        readDimensiones(file, rows);

        vp.reserve(rows);

        int i = 0;
        do {
            file >> x >> y;
            file >> std::ws;

            sp1::Point p(x, y);
            vp.push_back(p);

            ++i;
        } while (i < rows && !file.fail());

        if (i != rows || file.fail()) {
            codigo = sp1::ERROR_FORMATO;
        }
    }

    void readElements(std::ifstream &file, sp1::Vect_Elements &ve, sp1::Vect_Points &vp, sp1::Codigo &codigo) {
        int num1, num2, num3;
        int rows;

        readDimensiones(file, rows);

        ve.reserve(rows);

        int i = 0;
        do {
            file >> num1 >> num2 >> num3;
            file >> std::ws;

            sp1::Element e(&vp[num1 - 1], &vp[num2 - 1], &vp[num3 - 1]);
            ve.push_back(e);

            vp[num1 - 1].addElemento(&ve.back());
            vp[num2 - 1].addElemento(&ve.back());
            vp[num3 - 1].addElemento(&ve.back());

            ++i;
        } while (i < rows && !file.fail());

        if (i != rows || file.fail()) {
            codigo = sp1::ERROR_FORMATO;
        }
    }

    void readPermeabilities(std::ifstream &file, sp1::Vect_Elements &ve, sp1::Codigo &codigo) {
        float temp;
        int rows;

        readDimensiones(file, rows);

        int i = 0;
        do {
            file >> temp;
            file >> std::ws;

            ve[i].set_permeability(temp);
            ++i;
        } while (i < rows && !file.fail());

        if (i != rows || file.fail()) {
            codigo = sp1::ERROR_FORMATO;
        }
    }
}

namespace sp1 {

    void
    readFile(const std::string &rutaFile, sp1::Vect_Points &vp, sp1::Vect_Elements &ve, sp1::Codigo &codigo) {
        std::ifstream file(rutaFile.c_str());

        if (file.fail()) {
            codigo = ERROR_ABRIENDO_FICHERO;
        } else {
            std::string linea;

            // Leer nodos/puntos
            do {
                file >> std::ws;
                getline(file, linea);
            } while (linea != "# name: nodes" && !file.fail() && !file.eof());

            if (file.fail() || file.eof()) {
                codigo = ERROR_FORMATO;
                return;
            }

            readPoints(file, vp, codigo);
            if (codigo == ERROR_FORMATO) {
                return;
            }


            // Leer elements
            do {
                file >> std::ws;
                getline(file, linea);
            } while (linea != "# name: elems" && !file.fail() && !file.eof());

            if (file.fail() || file.eof()) {
                codigo = ERROR_FORMATO;
                return;
            }

            readElements(file, ve, vp, codigo);
            if (codigo == ERROR_FORMATO) {
                return;
            }


            // Leer permeabilityes
            do {
                file >> std::ws;
                getline(file, linea);
            } while (linea != "# name: elem_data" && !file.fail() && !file.eof());


            if (file.fail() || file.eof()) {
                codigo = ERROR_FORMATO;
                return;
            }

            readPermeabilities(file, ve, codigo);
            if (codigo == ERROR_FORMATO) {
                return;
            }


            codigo = OK;
            file.close();
        }
    }

    void escribirFile(const std::string &in, const std::string &out, sp1::Vect_Elements &ve, Codigo &codigo) {
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
                nuevo << ve[i].get_permeability() << std::endl;
            }

            codigo = OK;
            original.close();
            nuevo.close();
        }
    }
}

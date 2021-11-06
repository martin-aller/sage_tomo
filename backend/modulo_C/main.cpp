#include <iostream>
#include <ctime>
#include <vector>
#include <algorithm>
#include <sys/stat.h>
#include <string.h>

#include <iostream>
#include <fstream>

#include "gestionarFichero.hpp"
#include "funciones.hpp"
#include "imprimir.hpp"

using namespace std;
using namespace sp1;

int main(int argc, char **argv) {
    
    string plantilla_malla = "./modulo_C/plantilla.out";
    string directorio_salida;
    string nombre_usuario;
    string id_dataset;

    // Radio de los artefactos
    int min_radio = 4;
    int max_radio = 10; // Valor máximo probado: 10

    // Número de artefactos a insertar por malla
    int min_objetos_insertar = 1;
    int max_objetos_insertar = 3; // Valor máximo probado: 3

    // Valores de la conductividad para hacer el degradado
    int conductividad_maxima = 100;
    int conductividad_minima = 10;

    int numero_mallas_generar_por_radio;
	int n1_r = 25; //800
	int n2_r = 12; //400
	int n3_r = 10; //260
    int semilla = 0;
    int n_impedancias = 844;

	cout << argc;
	cout << argv[0];
	cout << argv[1];
	cout << argv[2];
	cout << argv[3];

    if (argc == 9){
		n1_r = atoi(argv[1]);
		n2_r = atoi(argv[2]);
		n3_r = atoi(argv[3]);

        min_radio = atoi(argv[4]);
        max_radio = atoi(argv[5]);

        nombre_usuario = argv[6];
        id_dataset = argv[7];
        semilla = atoi(argv[8]);
        n_impedancias = atoi(argv[9]);
        std::srand ( unsigned ( semilla ) );
        directorio_salida = "./directorio_usuarios/" + nombre_usuario + "/dataset" + id_dataset + "/mallas/";
        cout << directorio_salida;
        cout << semilla;
	}

    string out;
    Vect_Points vp;
    Vect_Elements ve;
    string dir_out_obj, dir_out_obj_rad;
    int elemento;
    vector<int> posiciones;

    Codigo codigo_error;
    leerFichero(plantilla_malla.c_str(), vp, ve, codigo_error);

    for (int num_objetos = min_objetos_insertar; num_objetos <= max_objetos_insertar; num_objetos++) {
        if (num_objetos == 1) {
            numero_mallas_generar_por_radio = n1_r; // Valor máximo posible: 800
        } else if (num_objetos == 2) {
            numero_mallas_generar_por_radio = n2_r; // Valor máximo posible: 400
        } else if (num_objetos == 3) {
            numero_mallas_generar_por_radio = n3_r; // Valor máximo posible: 260
        } else {
            numero_mallas_generar_por_radio = 1;
        }

        dir_out_obj = directorio_salida + to_string(num_objetos) + "obj" + "/";
        // mkdir(directorio_salida.c_str(), S_IRWXU | S_IRWXG | S_IROTH | S_IXOTH);
        // mkdir(dir_out_obj.c_str(), S_IRWXU | S_IRWXG | S_IROTH | S_IXOTH);
        int status;
        // system("mkdir -p ./directorio_usuarios/MARTINNN");
        system(("mkdir -p " + dir_out_obj).c_str());


        for (int radio = min_radio; radio <= max_radio; radio++) {
            dir_out_obj_rad = dir_out_obj + to_string(radio) + "/";
            // mkdir(dir_out_obj_rad.c_str(), S_IRWXU | S_IRWXG | S_IROTH | S_IXOTH);
            system(("mkdir -p " + dir_out_obj_rad).c_str());

            posiciones.clear();
            for (int i = 1; i <= 844; i++) {
                posiciones.push_back(i);
            }

            random_shuffle(posiciones.begin(), posiciones.end());

            for (int i = 1; i <= numero_mallas_generar_por_radio; i++) {
                restaurarPermeabilidades(ve);
                for (int j = 1; j <= num_objetos; j++) {
                    elemento = posiciones.back();
                    posiciones.pop_back();
                    reactivarElementos(ve);
                    cambiarConductividadElementos(elemento, radio, conductividad_maxima, conductividad_minima, ve);
                }

                out = dir_out_obj_rad + to_string(i) + ".out";
                escribirFichero(plantilla_malla.c_str(), out, ve, codigo_error);
            }
        }
    }

    return 0;
}

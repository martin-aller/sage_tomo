#include <iostream>
#include <ctime>
#include <vector>
#include <algorithm>
#include <sys/stat.h>
#include <string.h>

#include <iostream>
#include <fstream>

#include "gestionarFile.hpp"
#include "funciones.hpp"
#include "imprimir.hpp"

using namespace std;
using namespace sp1;

int main(int argc, char **argv) {
    
    string template_mesh = "./modulo_C/template.out";
    string directory_salida;
    string username;
    string id_dataset;

    // Radio de los artefactos
    int min_radio = 4;
    int max_radio = 10; // Valor máximo probado: 10

    // Número de artefactos a insert por mesh
    int min_objects_insert = 1;
    int max_objects_insert = 3; // Valor máximo probado: 3

    // Valores de la conductivity para hacer el degradado
    int conductivity_maxima = 100;
    int conductivity_minima = 10;

    int numero_meshes_generar_por_radio;
	int n1_r = 25; //800
	int n2_r = 12; //400
	int n3_r = 10; //260
    int seed = 0;
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

        username = argv[6];
        id_dataset = argv[7];
        seed = atoi(argv[8]);
        n_impedancias = atoi(argv[9]);
        std::srand ( unsigned ( seed ) );
        directory_salida = "./users_directory/" + username + "/dataset" + id_dataset + "/meshes/";
        cout << directory_salida;
        cout << seed;
	}

    string out;
    Vect_Points vp;
    Vect_Elements ve;
    string dir_out_obj, dir_out_obj_rad;
    int elemento;
    vector<int> posiciones;

    Codigo codigo_error;
    readFile(template_mesh.c_str(), vp, ve, codigo_error);

    for (int num_objects = min_objects_insert; num_objects <= max_objects_insert; num_objects++) {
        if (num_objects == 1) {
            numero_meshes_generar_por_radio = n1_r; // Valor máximo posible: 800
        } else if (num_objects == 2) {
            numero_meshes_generar_por_radio = n2_r; // Valor máximo posible: 400
        } else if (num_objects == 3) {
            numero_meshes_generar_por_radio = n3_r; // Valor máximo posible: 260
        } else {
            numero_meshes_generar_por_radio = 1;
        }

        dir_out_obj = directory_salida + to_string(num_objects) + "obj" + "/";
        // mkdir(directory_salida.c_str(), S_IRWXU | S_IRWXG | S_IROTH | S_IXOTH);
        // mkdir(dir_out_obj.c_str(), S_IRWXU | S_IRWXG | S_IROTH | S_IXOTH);
        int status;
        // system("mkdir -p ./users_directory/MARTINNN");
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

            for (int i = 1; i <= numero_meshes_generar_por_radio; i++) {
                restaurarPermeabilidades(ve);
                for (int j = 1; j <= num_objects; j++) {
                    elemento = posiciones.back();
                    posiciones.pop_back();
                    reactivarElementos(ve);
                    changeConductivityElementos(elemento, radio, conductivity_maxima, conductivity_minima, ve);
                }

                out = dir_out_obj_rad + to_string(i) + ".out";
                escribirFile(template_mesh.c_str(), out, ve, codigo_error);
            }
        }
    }

    return 0;
}

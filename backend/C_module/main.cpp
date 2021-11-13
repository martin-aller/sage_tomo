#include <iostream>
#include <ctime>
#include <vector>
#include <algorithm>
#include <sys/stat.h>
#include <string.h>

#include <iostream>
#include <fstream>

#include "manageFile.hpp"
#include "functions.hpp"
#include "print.hpp"

using namespace std;
using namespace sp1;

int main(int argc, char **argv) {
    fflush(stdout);

    
    string template_mesh = "./C_module/template.out";
    string username;
    string id_dataset; 
    string directory_output; 


    // Artifacts radii
    int min_radius = 4;
    int max_radius = 10; // Valor máximo probado: 10

    // Number of artifacts to insert per mesh
    int min_objects_insert = 1;
    int max_objects_insert = 3; 

    // Max and min conductivity values
    int conductivity_maxima = 100;
    int conductivity_minima = 10;

    int num_meshes_per_radius;
	int n1_r = 25;
	int n2_r = 12; 
	int n3_r = 10; 
    int seed = 0;
    int n_impedancias = 844;

	
	

    if (argc == 9){
		n1_r = atoi(argv[1]);
		n2_r = atoi(argv[2]);
		n3_r = atoi(argv[3]);

        min_radius = atoi(argv[4]);
        max_radius = atoi(argv[5]);
        username = argv[6];
        id_dataset = argv[7];
        seed = atoi(argv[8]);

        std::srand ( unsigned ( seed ) );

        directory_output = "./users_directory/" + username + "/dataset" + id_dataset + "/meshes/";

	}


    string out;
    Vect_Points vp;
    Vect_Elements ve;
    string dir_out_obj, dir_out_obj_rad;
    int element;
    vector<int> positions;

    Codigo error_code;

    readFile(template_mesh.c_str(), vp, ve, error_code);

    
    for (int num_objects = min_objects_insert; num_objects <= max_objects_insert; num_objects++) {

        if (num_objects == 1) {
            num_meshes_per_radius = n1_r; // Max possible value: 800
        } else if (num_objects == 2) {
            num_meshes_per_radius = n2_r; // Max possible value: 400
        } else if (num_objects == 3) {
            num_meshes_per_radius = n3_r; // Max possible value: 260
        } else {
            num_meshes_per_radius = 1;
        }

        dir_out_obj = directory_output + to_string(num_objects) + "obj" + "/";
        system(("mkdir -p " + dir_out_obj).c_str());
        

        for (int radius = min_radius; radius <= max_radius; radius++) {
            string sr = to_string(radius);

            dir_out_obj_rad = dir_out_obj + to_string(radius) + "/";            
            system(("mkdir -p " + dir_out_obj_rad).c_str());
            

            positions.clear();
            for (int i = 1; i <= 844; i++) {
                positions.push_back(i);
            }

            random_shuffle(positions.begin(), positions.end());

            for (int i = 1; i <= num_meshes_per_radius; i++) {
                restorePermeabilities(ve);

                for (int j = 1; j <= num_objects; j++) {
                    
                    element = positions.back();
                    positions.pop_back();
                    reactivateElements(ve);
                    changeConductivityElements(element, radius, conductivity_maxima, conductivity_minima, ve);
                }
                
                out = dir_out_obj_rad + to_string(i) + ".out";
                escribirFile(template_mesh.c_str(), out, ve, error_code);
            }
        }
    }
    
    return 0;
}

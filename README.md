
<h1>SageTomo</h1>

SageTomo is a scientific software for the reconstruction of Electrical Impedance Tomographies (EIT) using Machine Learning models. In order to understand the most relevant aspects of SageTomo, you can take a look into ***SAGETOMO_SUMMARY.pdf***, which includes explanations about the architecture and technologies used to develop the software. Furthermore, you can watch the demo video ***SAGETOMO_VIDEO.mp4***, where the fundamental functionalities of SageTomo are displayed.


![home_screenshot](/example_files/home_screenshot.png?raw=true)

The most important directories and files from the project are shown below:


* Directory ***backend***. It is a Django REST project. It includes:

    * Directory ***C_module***. It contains all the C++ classes that implement the algorithm used to insert artifacts in meshes when generating new datasets.

    * Directory ***EIT_module***. It contains the Python classes that implement the EIT functionalities (reconstruction of images, training of models, generation of datasets, etc).

    * Directory ***tomo***. It contains some of the most relevant Django files:
        * ***`models.py`***. It contains the definition of the models (Python classes) that are mapped on the BD.

        * ***`serializers.py`***. It contains the definition of the Python classes used to serialize the models defined in *`models.py`*.

        * ***`urls.py`***. It contains the URLs for all the REST API endpoints. Each endpoint is associated with a class or method from *`views.py`*.

        * ***`views.py`***. Here the REST services are defined. Each service is a Python class or a method.

    * Directory ***tomo_backend***.
        
        * ***`celery.py`***. In this file, the Celery app is instantiated. Celery is a Python framework that implements a task queue.

        * ***`settings.py`***. As its name suggests, here are defined all the Django project settings. For example, here is where you indicate the DB you wish to use.

<br>

* Directory ***frontend***. It is a React project. It includes:

    * Directory ***src***.

        * Directory ***datasets***. It includes all the app views related to the datasets.

        * Directory ***management***. It includes generic views (Login, Sign up, Home view, etc).

        * Directory ***models***. It includes all the app views related to the Machine Learning models.

        * Directory ***reconstruction_img***. It includes all the app views related to the datasets.

        * ***`Routes.js`***. In this file are defined the URLs for the different React classes.


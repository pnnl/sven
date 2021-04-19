sven-widget
===============================

A Jupyter widget for storyline visualizatition

Installation
------------

To install use pip:

    $ pip install sven
    $ jupyter nbextension enable --py --sys-prefix sven

To install for jupyterlab

    $ jupyter labextension install sven

For a development installation (requires npm),

    $ git clone https://github.com/PNNL/sven-widget.git
    $ cd sven-widget
    $ pip install -e .
    $ jupyter nbextension install --py --symlink --sys-prefix sven
    $ jupyter nbextension enable --py --sys-prefix sven
    $ jupyter labextension install js

When actively developing your extension, build Jupyter Lab with the command:

    $ jupyter lab --watch

This takes a minute or so to get started, but then automatically rebuilds JupyterLab when your javascript changes.

Note on first `jupyter lab --watch`, you may need to touch a file to get Jupyter Lab to open.


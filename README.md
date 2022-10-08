# VugA

## Installation

VugA requires Python >= 2.7.

The easiest way to install VugA is using [PyPA pip](https://pip.pypa.io/):

`$ sudo apt install python-pip`

### Dependencies

VugA requires:

* [Tornado](http://www.tornadoweb.org)

    `$ pip install tornado`

* [scikit-learn](http://scikit-learn.org)

    `$ pip install scikit-learn`

* [SciPy](https://www.scipy.org)

    `$ pip install --user numpy scipy matplotlib ipython pandas sympy nose`

* [simplejson](https://simplejson.readthedocs.io)

    `$ pip install simplejson`

* [Google API Client](https://developers.google.com/api-client-library/python/)

    `$ pip install --upgrade google-api-python-client`

* [Python-PostgreSQL Database Adapter](https://github.com/psycopg/psycopg2)

    `$ pip install psycopg2`

    `$ pip install psycopg2-binary`
    
    `sudo apt install -y postgresql postgresql-contrib postgresql-client`
    

* [Configuration file parser](https://docs.python.org/2/library/configparser.html)

    `$ pip install configparser`
    
* [Create database]
  
     `sudo -u postgress psql`
     `create database vexus2;`
     `alter user postgres WITH PASSWORD 'postgres';`
     `\l para verficar`
     `\q para salir`
     `sudo -u postgres psql -h hostname -d vexus2 < data_model_table_create.sql`

## Running

`$ python server.py`

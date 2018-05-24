import psycopg2
import json
from config import config

id_dataset = None


def create_dataset(dataset):
    global id_dataset
    conn = None
    try:
        params = config()
        print "Connecting to the PostgreSQL database ..."
        conn = psycopg2.connect(**params)
        cur = conn.cursor()
        print "PostgreSQL database version:"
        cur.execute("SELECT version()")
        print(cur.fetchone())
        cur.execute("INSERT INTO dataset(name) VALUES (%s) " +
                    "RETURNING id_dataset;", (dataset,))
        id_dataset = cur.fetchone()[0]
        print "Insert dataset {0}.".format(dataset)
        cur.close()
        conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()
            print("Database connection closed.")


def create_charts_titles_chart(dataViz):
    global id_dataset
    conn = None
    try:
        params = config()
        print "Connecting to the PostgreSQL database ..."
        conn = psycopg2.connect(**params)
        cur = conn.cursor()
        for dimension in dataViz["dimensions"]:
            cur.execute("INSERT INTO charts(id_dataset, name, type_chart) " +
                        "VALUES (%s, %s, %s) RETURNING id_chart;",
                        (id_dataset, dimension["name"], dimension["type_chart"]
                         ))
            id_chart = cur.fetchone()[0]
            for title in dimension["titles"]:
                cur.execute("INSERT INTO titles_chart(id_dataset, id_chart, " +
                            "value) VALUES (%s, %s, %s);",
                            (id_dataset, id_chart, title))

            print "Insert chart {0}.".format(dimension["name"])

        cur.close()
        conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()
            print("Database connection closed.")


def load_json(file):
  res = []
  with open(file) as jsonfile:
    res = json.load(jsonfile)
  return res


if __name__ == "__main__":
    # global id_dataset  # tmp
    print "Write the dataset name:"
    dataset = raw_input()
    print "Starting migration ..."
    # create_dataset(dataset)
    id_dataset = 2  # tmp
    path = str("static/data/" + dataset + "/dataViz.json")
    dataViz = load_json(path)
    create_charts_titles_chart(dataViz)
    print "End migration."

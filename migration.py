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


def create_charts_w_titles_chart(details):
    global id_dataset
    conn = None
    try:
        params = config()
        print "Connecting to the PostgreSQL database ..."
        conn = psycopg2.connect(**params)
        cur = conn.cursor()
        for dimension in details["Dimensions_charts"]:
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


def create_user_w_user_chart(dataViz, projection, details, object_1):
    global id_dataset
    conn = None
    try:
        params = config()
        print "Connecting to the PostgreSQL database ..."
        conn = psycopg2.connect(**params)
        cur = conn.cursor()
        for instance in dataViz["instances"]:
            for project in projection:
                if instance["id"] == project[2]:
                    instance["x"] = project[0]
                    instance["y"] = project[1]

            index_0 = 2
            while index_0 < len(object_1["headers"]):
                for obj in object_1["body"]:
                    if instance["id"] == obj[0]:
                        instance[object_1["headers"][index_0]] = obj[index_0]

                index_0 += 1

        index = 0
        while index < len(dataViz["instances"]):
            cur.execute("INSERT INTO public.user(id_dataset, idx, id, n, x, " +
                        "y, brillo) VALUES (%s, %s, %s, %s, %s, %s, %s) " +
                        "RETURNING id_user;",
                        (id_dataset, dataViz["instances"][index]["idx"],
                         dataViz["instances"][index]["id"],
                         dataViz["instances"][index]["n"],
                         dataViz["instances"][index]["x"],
                         dataViz["instances"][index]["y"],
                         dataViz["brillo"][index]))
            id_user = cur.fetchone()[0]
            index2 = 0
            while index2 < len(dataViz["instances"][index]["values"]):
                cur.execute("SELECT id_chart FROM charts WHERE id_dataset = " +
                            "%s AND name = %s AND type_chart = %s;",
                            (id_dataset,
                             details["Dimensions_charts"][index2]["name"],
                             details["Dimensions_charts"][index2]["type_chart"]
                             ))
                id_chart = cur.fetchone()[0]
                cur.execute("SELECT id_title FROM titles_chart WHERE " +
                            "id_dataset = %s AND id_chart = %s AND " +
                            "value = %s;",
                            (id_dataset, id_chart,
                             details["Dimensions_charts"][index2]["titles"]
                             [dataViz["instances"][index]["values"][index2]]))
                id_title = cur.fetchone()[0]
                if (details["Dimensions_charts"][index2]["name"]
                   in dataViz["instances"][index]):
                    cur.execute("INSERT INTO user_chart(id_dataset, " +
                                "id_user, id_chart, id_title, name) VALUES " +
                                "(%s, %s, %s, %s, %s);",
                                (id_dataset, id_user, id_chart, id_title,
                                 dataViz["instances"][index]
                                 [details["Dimensions_charts"]
                                  [index2]["name"]]))
                else:
                    cur.execute("INSERT INTO user_chart(id_dataset, " +
                                "id_user, id_chart, id_title) VALUES " +
                                "(%s, %s, %s, %s);",
                                (id_dataset, id_user, id_chart, id_title))

                index2 += 1

            print "Insert user {0}.".format(dataViz["instances"][index]["n"])
            index += 1

        cur.close()
        conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()
            print("Database connection closed.")


def create_dimension_w_user_dim(dimensions, dimension_vector):
    global id_dataset
    conn = None
    try:
        params = config()
        print "Connecting to the PostgreSQL database ..."
        conn = psycopg2.connect(**params)
        cur = conn.cursor()
        index = 1
        while index < len(dimensions["headers"]):
            cur.execute("INSERT INTO dimension(id_dataset, name) " +
                        "VALUES (%s, %s) RETURNING id_dim;",
                        (id_dataset, dimensions["headers"][index]))
            id_dim = cur.fetchone()[0]
            for dimension in dimensions["body"]:
                cur.execute("SELECT id_user FROM public.user charts WHERE " +
                            "id_dataset = %s AND id = %s;",
                            (id_dataset, dimension[0]))
                id_user = cur.fetchone()[0]

                index2 = 0
                while index2 < len(dimension_vector["names"]):
                    if dimension_vector["names"][index2] == dimension[0]:
                        break

                    index2 += 1

                if dimension_vector["body"][index2][index - 1] == 0:
                    cur.execute("INSERT INTO user_dim(id_dataset, id_user, " +
                                "id_dim, value, value_heat)" +
                                " VALUES (%s, %s, %s, %s, %s);",
                                (id_dataset, id_user, id_dim, dimension[index],
                                 -1))
                else:
                    cur.execute("INSERT INTO user_dim(id_dataset, id_user, " +
                                "id_dim, value, value_heat)" +
                                " VALUES (%s, %s, %s, %s, %s);",
                                (id_dataset, id_user, id_dim, dimension[index],
                                 dimension_vector["body"][index2][index - 1]))

            print "Insert dimension {0}.".format(dimensions["headers"][index])
            index += 1

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
    print "Write the dataset name:"
    dataset = raw_input()

    print "Starting migration ..."
    id_dataset = 2  # tmp
    path = str("static/data/" + dataset + "/details.json")
    details = load_json(path)
    path = str("static/data/" + dataset + "/dataViz.json")
    dataViz = load_json(path)
    path = str("static/data/" + dataset + "/projection.json")
    projection = load_json(path)
    path = str("static/data/" + dataset + "/object_1.json")
    object_1 = load_json(path)
    path = str("static/data/" + dataset + "/dimensions.json")
    dimensions = load_json(path)
    path = str("static/data/" + dataset + "/dimension_vector.json")
    dimension_vector = load_json(path)

    # create_dataset(dataset)
    # create_charts_w_titles_chart(details)
    # create_user_w_user_chart(dataViz, projection, details, object_1)
    create_dimension_w_user_dim(dimensions, dimension_vector)

    print "End migration."

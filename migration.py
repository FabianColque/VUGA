import psycopg2
import json
import time
import sys
from config import config

id_dataset = None
start = None


def create_dataset(dataset, object_2):
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
        cur.execute("INSERT INTO dataset(name, main_title) VALUES (%s, %s) " +
                    "RETURNING id_dataset;", (dataset, object_2["headers"][0]))
        id_dataset = cur.fetchone()[0]
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

            index += 1

        cur.close()
        conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()
            print("Database connection closed.")


def create_object_w_object_detail_w_object_title(object_2):
    global id_dataset
    conn = None
    try:
        params = config()
        print "Connecting to the PostgreSQL database ..."
        conn = psycopg2.connect(**params)
        cur = conn.cursor()
        index_0 = 1
        while index_0 < len(object_2["headers"]):
            cur.execute("INSERT INTO object_title(id_dataset, name) " +
                        "VALUES (%s, %s);",
                        (id_dataset, object_2["headers"][index_0]))
            index_0 += 1

        index = 0
        while index < len(object_2["body"]):
            cur.execute("INSERT INTO object(id_dataset, id) " +
                        "VALUES (%s, %s) RETURNING id_object;",
                        (id_dataset, object_2["body"][index][0]))
            id_object = cur.fetchone()[0]
            index2 = 1
            while index2 < len(object_2["body"][index]):
                cur.execute("SELECT id_title FROM object_title WHERE " +
                            "id_dataset = %s AND name = %s;",
                            (id_dataset, object_2["headers"][index2]))
                id_title = cur.fetchone()[0]
                cur.execute("INSERT INTO object_detail(id_dataset, " +
                            "id_object, id_title, value) " +
                            "VALUES (%s, %s, %s, %s);",
                            (id_dataset, id_object, id_title,
                             object_2["body"][index][index2]))
                index2 += 1

            index += 1

        cur.close()
        conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()
            print("Database connection closed.")


def create_rating(ratings, object_2):
    global id_dataset
    conn = None
    try:
        params = config()
        print "Connecting to the PostgreSQL database ..."
        conn = psycopg2.connect(**params)
        cur = conn.cursor()
        cur.execute("SELECT id_user, id FROM public.user " +
                    "WHERE id_dataset = %s;",
                    (id_dataset,))
        rows = cur.fetchall()
        for row in rows:
            id_user = row[0]
            for rating in ratings["body"][row[1]]:
                cur.execute("SELECT id_object FROM object " +
                            "WHERE id_dataset = %s AND id = %s",
                            (id_dataset, object_2["body"][rating["o2"]][0]))
                row2 = cur.fetchone()
                id_object = row2[0]
                value = rating["r"]
                cur.execute("INSERT INTO rating(id_dataset, id_user, " +
                            "id_object, value) VALUES (%s, %s, %s, %s);",
                            (id_dataset, id_user, id_object, value))

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


def mark_time():
    global start
    end = int(time.time())
    time_m = (end - start) / 60
    time_s = (end - start) % 60
    start = end
    return "{0}m {1}s".format(time_m, time_s)


if __name__ == "__main__":
    print "Write the dataset name:"
    dataset = raw_input()
    print "The dataset exist in dataset table?: (y/n)"
    yn = str(raw_input())
    if yn != "y" and yn != "n":
        print "You wrote a different option."
        sys.exit()

    print "Starting migration ..."
    start = int(time.time())
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
    path = str("static/data/" + dataset + "/object_2.json")
    object_2 = load_json(path)
    path = str("static/data/" + dataset + "/ratings.json")
    ratings = load_json(path)
    print "Loading json's: {0}.".format(mark_time())

    if yn == "y":
        print "Write the id_dataset:"
        id_dataset = int(raw_input())
    elif yn == "n":
        create_dataset(dataset, object_2)
        print "Inserting dataset data: {0}.".format(mark_time())

    create_charts_w_titles_chart(details)
    print "Inserting charts and titles_chart data: {0}.".format(mark_time())
    create_user_w_user_chart(dataViz, projection, details, object_1)
    print "Inserting user and user_chart data: {0}.".format(mark_time())
    create_dimension_w_user_dim(dimensions, dimension_vector)
    print "Inserting dimension and user_dim data: {0}.".format(mark_time())
    create_object_w_object_detail_w_object_title(object_2)
    print "Inserting object, object_detail and object_title data: {0}.".format(
          mark_time())
    create_rating(ratings, object_2)
    print "Inserting rating data: {0}.".format(mark_time())
    print "End migration."

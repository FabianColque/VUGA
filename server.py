import tornado.ioloop
import tornado.web
import os.path
from tornado import template

import csv

import json
import urllib2
import random
import glob
import operator
from sets import Set

from time import time
import numpy as np
import simplejson
from sklearn.feature_extraction.text import CountVectorizer,TfidfVectorizer
from sklearn.manifold import TSNE
from sklearn import manifold 
from sklearn.preprocessing import normalize
from sklearn import cluster

import scipy.cluster.hierarchy as hier
import scipy.spatial.distance as dist

import my_algorithm



class MyError(Exception):
  def __init__(self, value):
    self.value = value
  def __str__(self):
    return repr(self.value)

class MainHandler(tornado.web.RequestHandler) :
  def get(self):
    self.redirect('static/index.html')

#### START #### MY CLASSES ###################

# This class save the dataset in the Data Folder, it could be obj1, obj2, rating, dimensions.
class save_new_dataset_configuration(tornado.web.RequestHandler):
  def post(self):
    mydata = json.loads(self.request.body)
    dbname = mydata.get("dbname")
    route = 'static/data/' + dbname;
    exist_folder = os.path.isdir(route)
    if not exist_folder:
      os.makedirs(route)

    #esto estoy agregando por mientras aun no se si tiene que ir aqui  

    

    name_file = mydata.get("filename")
    data_final = mydata.get("data")
    headers = data_final[0]
    data_final = data_final[1:]
    if name_file == "object_2":
      data_final  = sorted(data_final)
    elif name_file == "ratings":
      path = "static/data/" + dbname + "/object_2.json"
      data_obj2 = load_json(path)
      rats = {};
      for df in data_final:
        idx = binary_search_movieID(data_obj2["body"], df[1])
        if not df[0] in rats:
          rats[df[0]] = []
        else:
          if idx != -1:
            rats[df[0]].append({"o2": idx, "r": df[2]})
        

    #hasta aqui
    data_final = {"headers": headers, "body": rats}

    with open( (route + '/' + mydata.get("filename") + '.json' ) , "w") as outfile:
      json.dump(data_final, outfile)  
    res = {"response": "yes"}
    self.write(json.dumps(res))  




# This class recover the name Folders from the Data Folder, these are the names of dataset availabe
class recover_name_datasets(tornado.web.RequestHandler):
  def post(self):
    path = "static/data/"
    dir_list = os.listdir(path)
    self.write(json.dumps(dir_list))    


class start_new_template_Viz(tornado.web.RequestHandler):
  def get(self):
    dbname = self.get_argument("g")
    self.render('vexus2.html', current_group=dbname)

class get_data_projection(tornado.web.RequestHandler):
  def post(self):
    mydata = json.loads(self.request.body)
    dbname = mydata.get("dbname")
    path = "static/data/" + dbname + "/projection.json";
    path = str(path)
    
    time0 = time()
    res = load_json(path)
    time1 = time()
    print_message("get_data_projection", time1 - time0)

    self.write(json.dumps(res))

class getData_Viz(tornado.web.RequestHandler):
  def post(self):
    mydata = json.loads(self.request.body)
    dbname = mydata.get("dbname")
    path = getpath_db(dbname) + "dataViz.json"
    
    time0 = time()
    data_viz = load_json(path)
    time1 = time()
    print_message("loading dataViz.json", time1 - time0)
    time0 = time()
    res = {"dimensions": data_viz["dimensions"], "instances": []}
    data_selected = mydata.get("data_selected")
    for ds in data_selected:
      res["instances"].append(data_viz["instances"][ds])
    time1 = time()
    print_message("getData_Viz", time1 - time0)    

    self.write(json.dumps(res))

class getDataObj2_table(tornado.web.RequestHandler):
  def post(self):
    mydata = json.loads(self.request.body)
    dbname = mydata.get("dbname")
    data_selected = mydata.get("data_selected")#this data is a array of Objects_1 IDs
    
    path = "static/data/" + dbname + "/"
    time0 = time()
    data_ratings = load_json(path + "ratings.json")
    time1 = time()
    print_message("load ratings.json", time1 - time0)

    time0 = time()
    data_obj2 = load_json(path + "object_2.json")
    time1 = time()
    print_message("load object_2.json", time1 - time0)

    time0 = time()
    headers = [data_obj2["headers"][0], data_obj2["headers"][1], "Rating"]
    for x in xrange(2, len(data_obj2["headers"])):
      headers.append(data_obj2["headers"][x])

    obj2 = {"headers": headers, "body": {}}

    for ds in data_selected:
      for dr in data_ratings["body"][str(ds)]:
        idx = dr["o2"]
        if not str(idx) in obj2["body"]:
          aux = [data_obj2["body"][idx][0], data_obj2["body"][idx][1], int(dr["r"])]
          for x in xrange(2, len(data_obj2["headers"])):
            aux.append(data_obj2["body"][idx][x])
          obj2["body"][str(idx)] = {"dat": aux, "len": 1}
        else:
          obj2["body"][str(idx)]["dat"][2] += int(dr["r"])
          obj2["body"][str(idx)]["len"] += 1;

    for oo in obj2["body"]:
      obj2["body"][oo]["dat"][2] = myformat_dec(obj2["body"][oo]["dat"][2]/obj2["body"][oo]["len"])
    time1 = time()
    print_message("getDataObj2_table", time1 - time0)

    self.write(json.dumps(obj2)) 


class get_heatmap(tornado.web.RequestHandler):
  def post(self):
    mydata = json.loads(self.request.body)
    dbname = mydata.get("dbname")
    data_selected = mydata.get("data_selected")

    time0 = time()
    data_dim = load_json(getpath_db(dbname) + "heatmap.json")
    res = {"headers": data_dim["headers"], "body": []}
    for uu in data_selected:
      res["body"].append(data_dim["body"][uu])
    time1 = time()
    print_message("get heatmap", time1 - time0)

    self.write(json.dumps(res))


class getDimension_legend(tornado.web.RequestHandler):
  def post(self):
    mydata = json.loads(self.request.body)
    dbname = mydata.get("dbname")
    dim_num = mydata.get("dimension_num")
    select = mydata.get("select")

    colors = ["#e6194b", "#3cb44b", "#ffe119", "#0082c8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#d2f53c", "#fabebe", "#008080", "#e6beff", "#aa6e28", "#800000", "#aaffc3", "#808000", "#ffd8b1", "#000080", "#b15928", "#6a3d9a", "#33a02c"]                    

    time0 = time()

    data = load_json(getpath_db(dbname) + "heatmap.json")
    details = load_json(getpath_db(dbname) + "details.json")
    res = {"selector": "#areaMainsvg_projection", "title": data["headers"][dim_num], "hasChecks": 1, "body": []}
    if len(details["Dimensions_charts"]) > dim_num:
      res["mode"] = "static"
      res["names"] = details["Dimensions_charts"][dim_num]["titles"]
      res["colors"] = colors[0:len(details["Dimensions_charts"][dim_num]["titles"])]
    else:
      res["mode"] = "dynamic"
      res["names"] = ["0", "1"]
      res["colors"] = ['#ffffb2','#fecc5c','#fd8d3c','#f03b20','#bd0026']

    if select == "all":
      for dd in data["body"]:
        res["body"].append(dd[dim_num])  
    else:
      for ss in select:
        res["body"].append(data["body"][ss][dim_num])

    time1 = time()
    print_message("getDimension_legend", time1 - time0)

    self.write(json.dumps(res))
    
class get_Details_options(tornado.web.RequestHandler):
  def post(self):
    mydata = json.loads(self.request.body)
    dbname = mydata.get("dbname")
    data_details = load_json(getpath_db(dbname) + "details.json")
    res = data_details["Dimensions_total"]
    self.write(json.dumps(res))

class getNewGroups(tornado.web.RequestHandler):
  def post(self):
    mydata = json.loads(self.request.body)
    dbname = mydata.get("dbname")
    data_selected = mydata.get("data_selected")
    
    
    #dataset = heatmap with the complete matrix normalized
    time0 = time()
    dataset = load_json(getpath_db(dbname) + "heatmap.json")
    dataset = dataset["body"]
    time1 = time()
    print_message("load heatmap.json", time1 - time0)

    #dimensionFull = File with dimensions not normalized, brute state
    time0 = time()
    dimensionsFull = load_csv_matrix(getpath_db(dbname) + "full_dimensions.csv")
    time1 = time()
    print_message("load full_dimensions.json", time1 - time0)

    #features = the details of the data dimensions
    time0 = time()
    features = load_json(getpath_db(dbname) + "details.json")
    features = features["features"]
    time1 = time()
    print_message("load detais.json", time1 - time0)

    #My algorithm
    time0 = time()
    res = my_algorithm.generate(dataset, data_selected, 5, dimensionsFull, features)#I want 5 new groups
    time1 = time()
    print_message("algorithm vexus2", time1 - time0)

    self.write(json.dumps(res))

####  END  #### MY CLASSES ###################

### functions for support START ###############

def print_message(label, mess):
  print "***************************"
  print "Time de %s : %s" % (label, mess)
  print "**************************"


def myformat_dec(x):
  hh = ('%.2f' % x).rstrip('0').rstrip('.')
  return float(hh)

def getpath_db(dbname):
  return ("static/data/" + dbname + "/")

def load_json(file):
  res = []
  with open(file) as jsonfile:
    res = json.load(jsonfile)
  return res

def load_csv_matrix(file):
  reader = csv.reader(open(file, 'rb'), delimiter = ",")
  X = list(reader)
  return np.array(X)    

def binary_search_movieID(data, target):
  lower = 0
  upper = len(data)
  while lower < upper:   # use < instead of <=
    x = lower + (upper - lower) // 2
    val = data[x][0] #array[x]
    if target == val:
      return x
    elif target > val:
      if lower == x:   # this two are the actual lines
          break        # you're looking for
      lower = x
    elif target < val:
      upper = x    
  return -1

### functions for support  END  ###############

settings = dict(
  template_path = os.path.join(os.path.dirname(__file__), "templates"),
  static_path = "static",
  debug = True
)    

application = tornado.web.Application([
  (r"/", MainHandler),
  (r"/save_new_dataset_configuration", save_new_dataset_configuration),
  (r"/recover_name_datasets", recover_name_datasets),
  (r"/get_data_projection", get_data_projection),
  (r"/vexus2", start_new_template_Viz),
  (r"/getData_Viz", getData_Viz),
  (r"/getDataObj2_table", getDataObj2_table),
  (r"/get_heatmap", get_heatmap),
  (r"/getDimension_legend", getDimension_legend),
  (r"/get_Details_options", get_Details_options),
  (r"/getNewGroups", getNewGroups),
  (r"/(.*)", tornado.web.StaticFileHandler, {'path' : './static', 'dafault_filename': 'index.html'})
  ], **settings)


if __name__ == "__main__":
  print "Server running ..."
  application.listen(8888)
  tornado.ioloop.IOLoop.instance().start()
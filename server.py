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
    res = load_json(path)
    self.write(json.dumps(res))

class getData_Viz(tornado.web.RequestHandler):
  def post(self):
    mydata = json.loads(self.request.body)
    dbname = mydata.get("dbname")
    path = getpath_db(dbname) + "dataViz.json"
    data_viz = load_json(path)
    res = {"dimensions": data_viz["dimensions"], "instances": []}
    data_selected = mydata.get("data_selected")
    for ds in data_selected:
      res["instances"].append(data_viz["instances"][ds])
    self.write(json.dumps(res))

class getDataObj2_table(tornado.web.RequestHandler):
  def post(self):
    mydata = json.loads(self.request.body)
    dbname = mydata.get("dbname")
    data_selected = mydata.get("data_selected")#this data is a array of Objects_1 IDs
    
    print "miercoles"
    print data_selected
    print "miercoles"

    path = "static/data/" + dbname + "/"
    data_ratings = load_json(path + "ratings.json")
    data_obj2 = load_json(path + "object_2.json")

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

    self.write(json.dumps(obj2)) 


class get_heatmap(tornado.web.RequestHandler):
  def post(self):
    mydata = json.loads(self.request.body)
    dbname = mydata.get("dbname")
    data_selected = mydata.get("data_selected")
    data_dim = load_json(getpath_db(dbname) + "heatmap.json")
    res = {"headers": data_dim["headers"], "body": []}
    for uu in data_selected:
      res["body"].append(data_dim["body"][uu])

    self.write(json.dumps(res))

####  END  #### MY CLASSES ###################

### functions for support START ###############

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
  (r"/(.*)", tornado.web.StaticFileHandler, {'path' : './static', 'dafault_filename': 'index.html'})
  ], **settings)


if __name__ == "__main__":
  print "Server running ..."
  application.listen(8888)
  tornado.ioloop.IOLoop.instance().start()
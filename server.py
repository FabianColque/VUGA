import tornado.ioloop
import tornado.web
import tornado.auth
import os.path
from tornado import template

import csv

import json
import urllib2
import random
import glob
import operator
from sets import Set
import math

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

from scipy.stats import scoreatpercentile

from copy import deepcopy
import copy

import my_algorithm
import my_spreadsheet

heatmap_movielens = [] 
ratings_movielens = []

class MyError(Exception):
  def __init__(self, value):
    self.value = value
  def __str__(self):
    return repr(self.value)

class BaseHandler(tornado.web.RequestHandler):
  def prepare(self):
    if not self.current_user:
      self.redirect("auth/google")
      return
  def get_current_user(self):
    return self.get_secure_cookie("token")

class MainHandler(BaseHandler):
  def get(self):
    for developer in self.settings["developers"]:
      if developer == self.get_secure_cookie("email"):
        self.redirect('static/index.html')
        return
    dataset = self.get_secure_cookie("dataset")
    if not dataset:
      count_user()
      path = "static/data/"
      dataset = os.listdir(path)[count_user() % len(os.listdir(path))]
      self.set_secure_cookie("dataset", dataset)
    self.redirect('vexus2?g=' + str(dataset))

#### START #### MY CLASSES ###################

# This class save the dataset in the Data Folder, it could be obj1, obj2, rating, dimensions.
class save_new_dataset_configuration(BaseHandler):
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
    
    if name_file == "object_2" or name_file == "object_1" or name_file == "dimensions":
      data_final  = sorted(data_final)
    elif name_file == "ratings":
      path = "static/data/" + dbname + "/object_2.json"
      data_obj2 = load_json(path)
      rats = {};
      for df in data_final:
        idx = binary_search_movieID(data_obj2["body"], df[1])
        if not df[0] in rats:
          rats[df[0]] = []
          rats[df[0]].append({"o2": idx, "r": df[2]})
        else:
          if idx != -1:
            rats[df[0]].append({"o2": idx, "r": df[2]})
      data_final = rats

    #hasta aqui
    data_final = {"headers": headers, "body": data_final}

    with open( (route + '/' + mydata.get("filename") + '.json' ) , "w") as outfile:
      json.dump(data_final, outfile)  
    res = {"response": "yes"}
    self.write(json.dumps(res))  

# This class recover the name Folders from the Data Folder, these are the names of dataset availabe
class recover_name_datasets(BaseHandler):
  def post(self):
    path = "static/data/"
    dir_list = os.listdir(path)
    self.write(json.dumps(dir_list))    

#adicional function to test the next option
#normalization by each user with each genre
#by example: user1 only has the drama and comedy genre, then
#the vector will be: [% , %, 0 , 0, 0, ...], % for the percentage of reviews in this dimension over the total reviews by user
def modiying_movielens_dimensions(arr_tsne, dimensionsData):
  print ('test arr_tsne: ', arr_tsne)
  print ('len arr_tsne', len(arr_tsne), len(arr_tsne[0]))
  print ('dimensionsData', dimensionsData)
  print ('len dimensionsData', len(dimensionsData["body"]), len(dimensionsData["body"][0]))

  modi = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36]
  totales_by_user = len(arr_tsne) * [0.0]
  for i in xrange(0, len(dimensionsData["body"])):
    for m in modi:
      totales_by_user[i] = totales_by_user[i] + float(dimensionsData["body"][i][m])
  for i in xrange(0, len(arr_tsne)):
    for m in modi:
      arr_tsne[i][m-1] = float(dimensionsData["body"][i][m])/totales_by_user[i]


  arr_tsne = np.delete(arr_tsne, 0, 1)
  #arr_tsne = np.delete(arr_tsne, 14, 1)

  for i in xrange(0,18):
    arr_tsne = np.delete(arr_tsne, i+1, 1)

  print ('test arr_tsne 2: ', arr_tsne)
  print ('len arr_tsne 2', len(arr_tsne), len(arr_tsne[0]))

  return arr_tsne


#Adicional like modiying_movielens_dimensions, but it is for Movielens with only #reviews, without AVG and #totalReviews
def modiying_movielens_only_Num_rating(arr_tsne, dimensionsData, heatmap):
  print ('test arr_tsne: ', arr_tsne)
  print ('len arr_tsne', len(arr_tsne), len(arr_tsne[0]))
  print ('dimensionsData', dimensionsData)
  print ('len dimensionsData', len(dimensionsData["body"]), len(dimensionsData["body"][0]))
  rangos = []
  totales_by_user = len(arr_tsne) * [0.0]
  for i in xrange(0, len(dimensionsData["body"])):
    for j in xrange(1, len(dimensionsData["body"][0])):
      totales_by_user[i] = totales_by_user[i] + float(dimensionsData["body"][i][j])
    rangos.append([2.0,-2.0])  
  

  #rangos = len(arr_tsne) * [[2,-2]]

  mayores = [0]*len(arr_tsne)
  brillo = [0]*len(arr_tsne)
  for i in xrange(0, len(arr_tsne)):
    for j in xrange(1, len(dimensionsData["body"][0])):
      arr_tsne[i][j-1] = float(dimensionsData["body"][i][j])/totales_by_user[i]
      if i == 0:
        print ('QQQQ: ', arr_tsne[i][j-1])
      if arr_tsne[i][j-1] != 0.0:
        rangos[i][0] = min(rangos[i][0], arr_tsne[i][j-1])
        rangos[i][1] = max(rangos[i][1], arr_tsne[i][j-1])

  heatmap["body"] = deepcopy(arr_tsne)



  #myscale2(old_min, old_max, new_min, new_max, old_value):
  #variable p_neighbor, min distance between two points
  p_neighbor = 0.02
  for i in xrange(0, len(heatmap["body"])):
    poss = 0
    aux_sort = []
    for j in xrange(0, len(heatmap["body"][0])):
      aux_sort.append(heatmap["body"][i][j])
      if heatmap["body"][i][j] == 0.0:
        heatmap["body"][i][j] = -1#bien aqui
      else:
        if j > 0:
          if heatmap["body"][i][j] > heatmap["body"][i][poss]:
            poss = j
      """if i == 0 and j == 0:
        print ("AAAAAAAAAA ", rangos[i][0], rangos[i][1], 0.0, 1.0, heatmap["body"][i][j])
        if heatmap["body"][i][j] == 0.0:
          heatmap["body"][i][j] = -1;
        else:
          heatmap["body"][i][j] = myscale2(rangos[i][0], rangos[i][1], 0.0, 1.0, heatmap["body"][i][j])

        if i == 0 and j == 0:
          print ("BBBBBBBBBB ", heatmap["body"][i][j])"""
    pass
    #mayores[i] = new_orders_ind[poss]
    mayores[i] = poss
    aux_sort.sort()
    #if aux_sort[len(aux_sort)-1]  - aux_sort[len(aux_sort)-2] <= p_neighbor:
      #mayores[i] = len(heatmap["body"][0]) + 1
    #brillo[i] = 1.0 - (aux_sort[len(aux_sort)-2]/aux_sort[len(aux_sort)-1])
    mean = np.mean(aux_sort)
    brillo[i] = 1.0 - ((aux_sort[len(aux_sort)-2]-mean)/(aux_sort[len(aux_sort)-1])-mean)

  print ("atencion", heatmap["body"][5848], mayores[5848])    

  print ('rangos [0]', rangos[0])
  print ('test arr_tsne 2: ', arr_tsne)
  print ('test arr[0] tsne2: ', arr_tsne[0])
  print ('len arr_tsne 2', len(arr_tsne), len(arr_tsne[0]))    

  return arr_tsne, heatmap, mayores, brillo



def modiying_health_data_dimension(arr_tsne, dimensionsData, heatmap):
  rangos = []
  arr_tsne = []
  sz = len(dimensionsData["body"])
  totales_by_user = sz * [0.0]
  for i in xrange(0, sz):
    auxaux = []
    for j in xrange(1, len(dimensionsData["body"][0])):
      totales_by_user[i] = totales_by_user[i] + float(dimensionsData["body"][i][j])
      auxaux.append(0.0)
    rangos.append([2.0,-2.0]) 
    arr_tsne.append(auxaux)

  arr_tsne = np.array(arr_tsne)

  mayores = [0]*sz
  brillo = [0]*sz
  for i in xrange(0, sz):
    for j in xrange(1, len(dimensionsData["body"][0])):
      #print ("vientooo", dimensionsData["body"][i][j], totales_by_user[i], dimensionsData["body"][i])
      arr_tsne[i][j-1] = float(str(dimensionsData["body"][i][j]))/totales_by_user[i]
      if i == 0:
        print ('QQQQ: ', arr_tsne[i][j-1])
      if arr_tsne[i][j-1] != 0.0:
        rangos[i][0] = min(rangos[i][0], arr_tsne[i][j-1])
        rangos[i][1] = max(rangos[i][1], arr_tsne[i][j-1])

  heatmap["body"] = deepcopy(arr_tsne)  

  p_neighbor = 0.02
  for i in xrange(0, len(heatmap["body"])):
    poss = 0
    aux_sort = []
    for j in xrange(0, len(heatmap["body"][0])):
      aux_sort.append(heatmap["body"][i][j])
      if heatmap["body"][i][j] == 0.0:
        heatmap["body"][i][j] = -1#bien aqui
      else:
        if j > 0:
          if heatmap["body"][i][j] > heatmap["body"][i][poss]:
            poss = j
      """if i == 0 and j == 0:
        print ("AAAAAAAAAA ", rangos[i][0], rangos[i][1], 0.0, 1.0, heatmap["body"][i][j])
        if heatmap["body"][i][j] == 0.0:
          heatmap["body"][i][j] = -1;
        else:
          heatmap["body"][i][j] = myscale2(rangos[i][0], rangos[i][1], 0.0, 1.0, heatmap["body"][i][j])

        if i == 0 and j == 0:
          print ("BBBBBBBBBB ", heatmap["body"][i][j])"""
    pass
    #mayores[i] = new_orders_ind[poss]
    mayores[i] = poss
    aux_sort.sort()
    #if aux_sort[len(aux_sort)-1]  - aux_sort[len(aux_sort)-2] <= p_neighbor:
      #mayores[i] = len(heatmap["body"][0]) + 1
    #brillo[i] = 1.0 - (aux_sort[len(aux_sort)-2]/aux_sort[len(aux_sort)-1])
    mean = np.mean(aux_sort)
    brillo[i] = 1.0 - ((aux_sort[len(aux_sort)-2]-mean)/(aux_sort[len(aux_sort)-1])-mean)

  #print ("atencion", heatmap["body"][5848], mayores[5848])    

  print ('rangos [0]', rangos[0])
  print ('test arr_tsne 2: ', arr_tsne)
  print ('test arr[0] tsne2: ', arr_tsne[0])
  print ('len arr_tsne 2', len(arr_tsne), len(arr_tsne[0]))    

  return arr_tsne, heatmap, mayores, brillo

def modiying_BX_data_dimension(arr_tsne, dimensionsData, heatmap):
  rangos = []
  arr_tsne = []
  sz = len(dimensionsData["body"])
  totales_by_user = sz * [0.0]
  for i in xrange(0, sz):
    auxaux = []
    for j in xrange(1, len(dimensionsData["body"][0])):
      totales_by_user[i] = totales_by_user[i] + float(dimensionsData["body"][i][j])
      auxaux.append(0.0)
    rangos.append([2.0,-2.0]) 
    arr_tsne.append(auxaux)

  arr_tsne = np.array(arr_tsne)

  mayores = [0]*sz
  brillo = [0]*sz
  for i in xrange(0, sz):
    for j in xrange(1, len(dimensionsData["body"][0])):
      #print ("vientooo", dimensionsData["body"][i][j], totales_by_user[i], dimensionsData["body"][i])
      arr_tsne[i][j-1] = float(str(dimensionsData["body"][i][j]))/totales_by_user[i]
      if i == 0:
        print ('QQQQ: ', arr_tsne[i][j-1])
      if arr_tsne[i][j-1] != 0.0:
        rangos[i][0] = min(rangos[i][0], arr_tsne[i][j-1])
        rangos[i][1] = max(rangos[i][1], arr_tsne[i][j-1])

  heatmap["body"] = deepcopy(arr_tsne)  

  p_neighbor = 0.02
  for i in xrange(0, len(heatmap["body"])):
    poss = 0
    aux_sort = []
    for j in xrange(0, len(heatmap["body"][0])):
      aux_sort.append(heatmap["body"][i][j])
      if heatmap["body"][i][j] == 0.0:
        heatmap["body"][i][j] = -1#bien aqui
      else:
        if j > 0:
          if heatmap["body"][i][j] > heatmap["body"][i][poss]:
            poss = j
      """if i == 0 and j == 0:
        print ("AAAAAAAAAA ", rangos[i][0], rangos[i][1], 0.0, 1.0, heatmap["body"][i][j])
        if heatmap["body"][i][j] == 0.0:
          heatmap["body"][i][j] = -1;
        else:
          heatmap["body"][i][j] = myscale2(rangos[i][0], rangos[i][1], 0.0, 1.0, heatmap["body"][i][j])

        if i == 0 and j == 0:
          print ("BBBBBBBBBB ", heatmap["body"][i][j])"""
    pass
    #mayores[i] = new_orders_ind[poss]
    mayores[i] = poss
    aux_sort.sort()
    #if aux_sort[len(aux_sort)-1]  - aux_sort[len(aux_sort)-2] <= p_neighbor:
      #mayores[i] = len(heatmap["body"][0]) + 1
    #brillo[i] = 1.0 - (aux_sort[len(aux_sort)-2]/aux_sort[len(aux_sort)-1])
    mean = np.mean(aux_sort)
    brillo[i] = 1.0 - ((aux_sort[len(aux_sort)-2]-mean)/(aux_sort[len(aux_sort)-1])-mean)

  #print ("atencion", heatmap["body"][5848], mayores[5848])    

  print ('rangos [0]', rangos[0])
  print ('test arr_tsne 2: ', arr_tsne)
  print ('test arr[0] tsne2: ', arr_tsne[0])
  print ('len arr_tsne 2', len(arr_tsne), len(arr_tsne[0]))    

  return arr_tsne, heatmap, mayores, brillo

class is_load_spreadsheet(BaseHandler):
  def post(self):
    if my_spreadsheet.is_load_spreadsheet(self.get_secure_cookie("email")):
      self.write("1")
    else:
      self.write("0")

class get_email(BaseHandler):
  def post(self):
    self.write(self.get_secure_cookie("email"))

class is_developer(BaseHandler):
  def post(self):
    for developer in self.settings["developers"]:
      if developer == self.get_secure_cookie("email"):
        self.write("1")
        return
    self.write("0")

class certified_user(BaseHandler):
  def post(self):
    data = {}
    data['user'] = []

    filename = 'log/users.json'
    if not os.path.exists(os.path.dirname(filename)):
      try:
        os.makedirs(os.path.dirname(filename))
      except OSError as exc:
        if exc.errno != errno.EEXIST:
          raise
    else:
      if os.path.exists(filename):
        with open(filename) as json_data:
          data = json.load(json_data)

    try:
      for datum in data["user"]:
        if datum["profile"]["email"] == self.get_secure_cookie("email"):
          if datum["status"] == 0:
            self.write("0")
            return
          elif datum["status"] == 1:
            self.write("1")
            return
          elif datum["status"] == 2:
            self.write("2")
            return
          elif datum["status"] == 3:
            self.write("3")
            return
          break
    except KeyError, e:
      print 'I got a KeyError - reason "%s"' % str(e)

    with open(filename, "w+") as outfile:
      json.dump(data, outfile)
    self.write("-1")

class register_user(BaseHandler):
  def get(self):
    data = {}
    data['user'] = []

    filename = 'log/users.json'
    if not os.path.exists(os.path.dirname(filename)):
      try:
        os.makedirs(os.path.dirname(filename))
      except OSError as exc:
        if exc.errno != errno.EEXIST:
          raise
    else:
      if os.path.exists(filename):
        with open(filename) as json_data:
          data = json.load(json_data)

    user = {}
    user['id'] = self.get_secure_cookie("id")
    user["dataset"] = self.get_secure_cookie("dataset")
    user['start_tour'] = time()
    user['end_tour'] = None
    user['start_interaction'] = None
    user['end_interaction'] = None
    user['start_form'] = None
    user['end_form'] = None
    user['status'] = 0
    user['profile'] = {}
    user['profile']['given_name'] = self.get_secure_cookie("given_name")
    user['profile']['family_name'] = self.get_secure_cookie("family_name")
    user['profile']['email'] = self.get_secure_cookie("email")
    user['profile']['picture'] = self.get_secure_cookie("picture")
    user['profile']['locale'] = self.get_secure_cookie("locale")

    change = True
    for idx, datum in enumerate(data["user"]):
      if datum["profile"]["email"] == user["profile"]["email"]:
        change = False
        data["user"][idx]["start_tour"] = time()
        data["user"][idx]["status"] = 0
        break

    if change:
      data['user'].append(user)
    with open(filename, "w+") as outfile:
      json.dump(data, outfile)

class end_tour(BaseHandler):
  def get(self):
    data = {}
    data['user'] = []

    filename = 'log/users.json'
    if not os.path.exists(os.path.dirname(filename)):
      try:
        os.makedirs(os.path.dirname(filename))
      except OSError as exc:
        if exc.errno != errno.EEXIST:
          raise
    else:
      if os.path.exists(filename):
        with open(filename) as json_data:
          data = json.load(json_data)

    change = True
    for idx, datum in enumerate(data["user"]):
      if datum["profile"]["email"] == self.get_secure_cookie("email"):
        change = False
        data["user"][idx]["status"] = 1
        data["user"][idx]["end_tour"] = time()
        break

    if change:
      print "Cannot find the user %s" % str(self.get_secure_cookie("email"))
    with open(filename, "w+") as outfile:
      json.dump(data, outfile)

class start_user(BaseHandler):
  def get(self):
    data = {}
    data['user'] = []

    filename = 'log/users.json'
    if not os.path.exists(os.path.dirname(filename)):
      try:
        os.makedirs(os.path.dirname(filename))
      except OSError as exc:
        if exc.errno != errno.EEXIST:
          raise
    else:
      if os.path.exists(filename):
        with open(filename) as json_data:
          data = json.load(json_data)

    change = True
    for idx, datum in enumerate(data["user"]):
      if datum["profile"]["email"] == self.get_secure_cookie("email"):
        change = False
        data["user"][idx]["status"] = 1
        data["user"][idx]["start_interaction"] = time()
        break

    if change:
      print "Cannot find the user %s" % str(self.get_secure_cookie("email"))
    with open(filename, "w+") as outfile:
      json.dump(data, outfile)

class end_user(BaseHandler):
  def get(self):
    data = {}
    data['user'] = []

    filename = 'log/users.json'
    if not os.path.exists(os.path.dirname(filename)):
      try:
        os.makedirs(os.path.dirname(filename))
      except OSError as exc:
        if exc.errno != errno.EEXIST:
          raise
    else:
      if os.path.exists(filename):
        with open(filename) as json_data:
          data = json.load(json_data)

    change = True
    for idx, datum in enumerate(data["user"]):
      if datum["profile"]["email"] == self.get_secure_cookie("email"):
        change = False
        data["user"][idx]["status"] = 2
        data["user"][idx]["end_interaction"] = time()
        break

    if change:
      print "Cannot find the user %s" % str(self.get_secure_cookie("email"))
    with open(filename, "w+") as outfile:
      json.dump(data, outfile)

class start_form(BaseHandler):
  def get(self):
    data = {}
    data['user'] = []

    filename = 'log/users.json'
    if not os.path.exists(os.path.dirname(filename)):
      try:
        os.makedirs(os.path.dirname(filename))
      except OSError as exc:
        if exc.errno != errno.EEXIST:
          raise
    else:
      if os.path.exists(filename):
        with open(filename) as json_data:
          data = json.load(json_data)

    change = True
    for idx, datum in enumerate(data["user"]):
      if datum["profile"]["email"] == self.get_secure_cookie("email"):
        change = False
        data["user"][idx]["status"] = 2
        data["user"][idx]["start_form"] = time()
        break

    if change:
      print "Cannot find the user %s" % str(self.get_secure_cookie("email"))
    with open(filename, "w+") as outfile:
      json.dump(data, outfile)

class end_form(BaseHandler):
  def get(self):
    data = {}
    data['user'] = []

    filename = 'log/users.json'
    if not os.path.exists(os.path.dirname(filename)):
      try:
        os.makedirs(os.path.dirname(filename))
      except OSError as exc:
        if exc.errno != errno.EEXIST:
          raise
    else:
      if os.path.exists(filename):
        with open(filename) as json_data:
          data = json.load(json_data)

    change = True
    for idx, datum in enumerate(data["user"]):
      if datum["profile"]["email"] == self.get_secure_cookie("email"):
        change = False
        data["user"][idx]["status"] = 3
        data["user"][idx]["end_form"] = time()
        break

    if change:
      print "Cannot find the user %s" % str(self.get_secure_cookie("email"))
    with open(filename, "w+") as outfile:
      json.dump(data, outfile)

def count_user():
  data = {}
  data['user'] = []

  filename = 'log/users.json'
  if not os.path.exists(os.path.dirname(filename)):
    try:
      os.makedirs(os.path.dirname(filename))
    except OSError as exc:
      if exc.errno != errno.EEXIST:
        raise
  else:
    if os.path.exists(filename):
      with open(filename) as json_data:
        data = json.load(json_data)

  return len(data["user"])

#This class save and generate the new files as dataViz and details .json
class save_and_generate_newData(BaseHandler):
  def post(self):
    details = json.loads(self.request.body)
    dbname = str(details.get("dbname"))
    
    #Genering the details.json
    detailsjson = {"Dimensions_total": details["Dimensions_total"], "Dimensions_charts": [], "features": details["features"], "dim_toProj": []}     
    dimensionsData = load_json(getpath_db(dbname) + "dimensions.json")

    dataObj1 = load_json(getpath_db(dbname) + "object_1.json")
    print ("headers", dimensionsData["headers"])
    dimen_proj = []
    ite = -1

    for dc in details["Dimensions_charts"]:
      ite += 1
      if dc["isproj"] == "1":
        #if this dimension is a projection dimension
        dimen_proj.append(ite)
      if dc["t_var"] == "Categorical":
        #busqueda de todas las posibles categorias
        auxset = set()
        #hans = 1
        for di in dataObj1["body"]:
          #if hans < 3:
            #print ("zimmer", di, ite)
            #hans += 1
          auxprepre = details["Dimensions_charts"][ite]["idx"]+1
          #auxset.add(di[ite+2])
          auxset.add(di[auxprepre])
        detailsjson["Dimensions_charts"].append({"name": dc["name"], "titles": list(auxset), "type_chart": dc["type_chart"]})
      else:
        if len(dc["dom"]) == 0:
          detailsjson["Dimensions_charts"].append({"name": dc["name"], "titles": [], "type_chart": dc["type_chart"]})     
        else:
          detailsjson["Dimensions_charts"].append({"name": dc["name"], "titles": dc["ran"], "type_chart": dc["type_chart"]})
      

    detailsjson["dim_toProj"] = dimen_proj
    save_json(getpath_db(dbname) + "details.json", detailsjson)

    print ("detailsjson", detailsjson["Dimensions_charts"])
    
    dataViz = {"dimensions": detailsjson["Dimensions_charts"], "instances": []}
    for i_body in xrange(0, len(dataObj1["body"])):
      aux = {}
      aux["idx"] = i_body
      aux["id"] = dataObj1["body"][i_body][0]
      aux["n"] = dataObj1["body"][i_body][1]
      aux["values"] = []
      for i_dim in xrange(0, len(dataViz["dimensions"])):
        i_dim_obj = details["Dimensions_charts"][i_dim]["idx"] + 1

        #verificar si es una dimension para proyectar y cambiar su valor a numero
        ind_proj = -1
        flag_proj = False
        if details["Dimensions_charts"][i_dim]["isproj"] == "1":
          flag_proj = True
          ind_proj = dimen_proj.index(i_dim)


        if details["Dimensions_charts"][i_dim]["t_var"] == "Categorical":
          #print ("donde esyou", i_body, i_dim_obj, dataViz["dimensions"][i_dim]["titles"])
          i_aux = dataViz["dimensions"][i_dim]["titles"].index(dataObj1["body"][i_body][i_dim_obj])
          aux["values"].append(i_aux)
          if flag_proj:
            dimensionsData["body"][i_body][ind_proj] = i_aux
        else:
          for i_dom in xrange(0, len(details["Dimensions_charts"][i_dim]["dom"])):
            if i_dom == 0 and int(dataObj1["body"][i_body][i_dim+2]) < int(details["Dimensions_charts"][i_dim]["dom"][i_dom]):
              aux["values"].append(0)
              if flag_proj:
                dimensionsData["body"][i_body][ind_proj] = 0.0 
            elif i_dom == (len(details["Dimensions_charts"][i_dim]["dom"])-1) and int(dataObj1["body"][i_body][i_dim+2]) >= int(details["Dimensions_charts"][i_dim]["dom"][i_dom]):
              aux["values"].append(i_dom+1)
              if flag_proj:
                dimensionsData["body"][i_body][ind_proj] = i_dom + 1.0
            elif int(dataObj1["body"][i_body][i_dim+2]) >= int(details["Dimensions_charts"][i_dim]["dom"][i_dom-1]) and int(dataObj1["body"][i_body][i_dim+2]) < int(details["Dimensions_charts"][i_dim]["dom"][i_dom]):
              aux["values"].append(i_dom)
              if flag_proj:
                dimensionsData["body"][i_body][ind_proj] = i_dom
      dataViz["instances"].append(aux)
    save_json(getpath_db(dbname) + "dataViz.json", dataViz)       

    #Generate the heatmap and projection

    details_limits = []
    i_aux = 0
    len_charts_proj = len(dimen_proj)
    if len_charts_proj == 0:
      len_charts_proj = -1

    es_apto1 = True#true cuando quiero que sea Health, false para movielens 
    if not es_apto1: 
      for ftr in detailsjson["features"]:
        if i_aux < len_charts_proj:
          #if we have some chart Dimension as projection dimension 
          print ("\n\n\n\n")     
          print ("chart 10000")
          print ("\n\n\n\n")     
          details_limits.append([0, len(detailsjson["Dimensions_charts"][dimen_proj[i_aux]]["titles"])-1])
        elif ftr["type"] == "String":
          print ("\n\n\n\n")     
          print ("string 10000")
          print ("\n\n\n\n")   
          details_limits.append([100000, -100000])
        else:
          if ftr["detail"] == []:
            details_limits.append([100000, -100000])
          else:
            details_limits.append(np.copy(ftr["detail"]))
        i_aux += 1

      for d_d in dimensionsData["body"]:
        for i_ftr in xrange(0, len(details["features"])):
          if i_ftr >= len_charts_proj and details["features"][i_ftr]["detail"] == []:
            d_d[i_ftr + 1] = float(d_d[i_ftr + 1])
            details_limits[i_ftr][0] = min(details_limits[i_ftr][0], d_d[i_ftr+1])
            details_limits[i_ftr][1] = max(details_limits[i_ftr][1], d_d[i_ftr+1])

      #comvert the matrix in numpy matrix
      dimensionsData["body"] = np.array(dimensionsData["body"])
      print ("impresion de auxilio1", details["features"])
      print ("\n\n\n\n")     
      print ("limits1", details_limits) 
      #calculating the percentiles for the normalization
      for i_ftr in xrange(0, len(details["features"])):
        arraynp_aux = []
        if isNumber(dimensionsData["body"][0][i_ftr+1]):
          arraynp_aux = np.array(dimensionsData["body"][:, i_ftr+1], dtype=float)
        if i_ftr >= len_charts_proj and details["features"][i_ftr]["detail"] != []:
          details_limits[i_ftr][0] = np.min(arraynp_aux)
          details_limits[i_ftr][1] = np.max(arraynp_aux)
        if i_ftr >= len_charts_proj and details["features"][i_ftr]["detail"] == []:
          q1 = scoreatpercentile(arraynp_aux, 25)
          q3 = scoreatpercentile(arraynp_aux, 75)
          iqd = q3 - q1
          md = np.median(arraynp_aux)
          whisker = 1.5*iqd
          minwhisker = md - whisker
          if minwhisker < 0.0:
            minwhisker = 0.0
          details_limits[i_ftr] = [minwhisker, md + whisker]
      print ("\n\n\n\n")     
      print ("impresion de auxilio2", details["features"])          
      print ("\n\n\n\n")     
      print ("limits1", details_limits) 
      

    #here we are going to use the t-sne to project the data

    dimensionsData["body"] = np.array(dimensionsData["body"])

    arr_tsne = []
    heatmap_tsne = []
    es_apto2 = True#true cuando quiero que sea Health, false para movielens
    if not es_apto2:
      i_body = 0
      for body in dimensionsData["body"]:
        aux = []
        aux_heat = []
        for i_ftr in xrange(0, len(details["features"])):
          val = 0.0
          val_heat = 0.0
          if i_ftr < len_charts_proj:
            #print ("chart ...")
            val_aux = dataViz["instances"][i_body]["values"][dimen_proj[i_ftr]]
            val = myscale(details_limits[i_ftr][0], details_limits[i_ftr][1], 0.0, 1.0, float(val_aux), False)
            val_heat = val
          elif detailsjson["features"][i_ftr]["type"] == "String":
            #print ("String ...")
            val_aux = detailsjson["Dimensions_charts"][i_ftr]["titles"].index(body[i+1])
            val = myscale(details_limits[i_ftr][0], details_limits[i_ftr][1], 0.0, 1.0, float(val_aux), False)
            val_heat = val
          else:
            if details["features"][i_ftr]["detail"] == []:
              print ("vacio ...", details_limits[i_ftr][0], details_limits[i_ftr][1], body[i_ftr+1], i_ftr + 1, i_body)
              val = myscale(float(details_limits[i_ftr][0]), float(details_limits[i_ftr][1]), 0.0, 1.0, float(body[i_ftr+1]), True)
              if float(body[i_ftr+1]) < float(details_limits[i_ftr][0]):
                val_heat = 0.0
              elif float(body[i_ftr+1]) > float(details_limits[i_ftr][1]):
                val_heat = 1.0
              else:
                val_heat = val
              
            else:
              #print ("lleno ...")
              val = myscale(float(details_limits[i_ftr][0]), float(details_limits[i_ftr][1]), 0.0, 1.0, float(body[i_ftr+1]), False)
              
              if float(body[i_ftr+1]) < float(details["features"][i_ftr]["detail"][0]) or float(body[i_ftr+1]) > float(details["features"][i_ftr]["detail"][1]):
                #print ("-1 ...")
                val_heat = -1
                
              else:
                val_heat = myscale(float(details["features"][i_ftr]["detail"][0]), float(details["features"][i_ftr]["detail"][1]), 0.0, 1.0, float(body[i_ftr+1]), False)
                
          aux.append(val)
          aux_heat.append(val_heat)
        arr_tsne.append(aux)
        heatmap_tsne.append(aux_heat)
        i_body += 1

    arr_tsne = np.array(arr_tsne)
    heatmap_tsne = np.array(heatmap_tsne)
    heatmap_tsne = heatmap_tsne.tolist()
    """
    fabian = arr_tsne.tolist()
    hois = {"body": fabian}
    save_json(getpath_db(dbname) + "normalization_projection.json", hois)
    """
    heatmap = {"headers": dimensionsData["headers"][1:], "body": heatmap_tsne}
    

    data_viz = load_json(getpath_db(dbname) + "dataViz.json")

    
    if dbname == "Movielens Test":
      arr_tsne = modiying_movielens_dimensions(arr_tsne, dimensionsData)

#***************************************************************************************************************************************
    mayores = []  
    if dbname == "Movielens only Rating":#"NewBookCrossing":#"Movielens only Rating":
      #new_orders_ind = [2, 6, 11, 10, 1, 7, 17, 0, 14, 15, 9, 13, 12, 5, 4, 3, 6, 16]
      new_order_names = ["Drama", "Comedy", "Action", "Thriller", "Sci-Fi", "Romance", "Adventure", "Crime", "War", "Horror", "Children", "Animation", "Mystery", "Musical", "Fantasy", "Film-Noir", "Western", "Documentary"]
      arr_tsne, heatmap, mayores, brillo = modiying_movielens_only_Num_rating(arr_tsne, dimensionsData, heatmap)
      for i in xrange(0, len(heatmap["body"])):
        dataViz["instances"][i]["values"].append(mayores[i])
      dataViz["brillo"] = brillo
      data_deta = load_json(getpath_db(dbname) + "details.json")
      data_deta["Dimensions_charts"].append({"type_chart": "", "titles": new_order_names, "name": "Genre"})
      #["n_RevAction", "n_RevAdventure", "n_RevAnimation", "n_RevChildrens", "n_RevComedy", "n_RevCrime", "n_RevDocumentary", "n_RevDrama", "n_RevFantasy", "n_RevFilm-Noir", "n_RevHorror", "n_RevMusical", "n_RevMystery", "n_RevRomance", "n_RevSci-Fi", "n_RevThriller", "n_RevWar", "n_RevWestern"]
      save_json(getpath_db(dbname) + "dataViz.json", dataViz)
      save_json(getpath_db(dbname) + "details.json", data_deta)

#***************************************************************************************************************************************
    if dbname == "health1":
      #modiying_health_data_dimension
      new_order_names = ["RESPIRATOIRE", "bmi", "iah", "PERFUSION", "epworth", "NUTRITION", "INSULINE", "REHABILITATION"]
      #new_order_names = ["bmi", "iah", "PERFUSION", "epworth", "NUTRITION", "INSULINE", "REHABILITATION"]
      #new_order_names = ["PERFUSION","NUTRITION", "INSULINE", "REHABILITATION"]
      
      arr_tsne, heatmap, mayores, brillo = modiying_health_data_dimension(arr_tsne, dimensionsData, heatmap)
      for i in xrange(0, len(heatmap["body"])):
        dataViz["instances"][i]["values"].append(mayores[i])
      dataViz["brillo"] = brillo
      data_deta = load_json(getpath_db(dbname) + "details.json")

      data_deta["Dimensions_charts"].append({"type_chart": "", "titles": new_order_names, "name": "Category"})
      #["n_RevAction", "n_RevAdventure", "n_RevAnimation", "n_RevChildrens", "n_RevComedy", "n_RevCrime", "n_RevDocumentary", "n_RevDrama", "n_RevFantasy", "n_RevFilm-Noir", "n_RevHorror", "n_RevMusical", "n_RevMystery", "n_RevRomance", "n_RevSci-Fi", "n_RevThriller", "n_RevWar", "n_RevWestern"]
      save_json(getpath_db(dbname) + "dataViz.json", dataViz)
      save_json(getpath_db(dbname) + "details.json", data_deta)      

      #generando un archivo para los anhos de health1
      ratings_health  = load_json(getpath_db(dbname) +  "ratings.json")
      years_health = {}
      #{"body": {"5988": [{"r": "2014", "o2": 39}
      for i in ratings_health["body"]:
        #print ("PANINI", i, ratings_health["body"][i])
        for j in xrange(0, len(ratings_health["body"][i])):
          ye = str(ratings_health["body"][i][j]["r"])
          if ye not in years_health:
            years_health[ye] = {}
          years_health[ye][i] = 1
      years_health = {"body": years_health}
      save_json(getpath_db(dbname) + "years.json", years_health)    


#***************************************************************************************************************************************

    if dbname == "NewBookCrossing":
      #modiying_health_data_dimension
      #new_order_names = ['fiction', 'nonfiction', 'romance', 'mystery', 'fantasy', 'historical_fiction', 'classics', 'thriller', 'science_fiction', 'young_adult', 'contemporary', 'crime', 'history', 'biography', 'horror', 'memoir', 'religion', 'science']
      new_order_names = ['nonfiction', 'mystery', 'romance', 'fantasy', 'historical_fiction', 'classics', 'thriller', 'science_fiction', 'young_adult', 'crime', 'contemporary', 'horror', 'history', 'biography', 'memoir', 'religion', 'philosophy', 'science']
      
      arr_tsne, heatmap, mayores, brillo = modiying_BX_data_dimension(arr_tsne, dimensionsData, heatmap)
      for i in xrange(0, len(heatmap["body"])):
        dataViz["instances"][i]["values"].append(mayores[i])
      dataViz["brillo"] = brillo
      data_deta = load_json(getpath_db(dbname) + "details.json")

      data_deta["Dimensions_charts"].append({"type_chart": "", "titles": new_order_names, "name": "Genre"})
      #["n_RevAction", "n_RevAdventure", "n_RevAnimation", "n_RevChildrens", "n_RevComedy", "n_RevCrime", "n_RevDocumentary", "n_RevDrama", "n_RevFantasy", "n_RevFilm-Noir", "n_RevHorror", "n_RevMusical", "n_RevMystery", "n_RevRomance", "n_RevSci-Fi", "n_RevThriller", "n_RevWar", "n_RevWestern"]
      save_json(getpath_db(dbname) + "dataViz.json", dataViz)
      save_json(getpath_db(dbname) + "details.json", data_deta)


#****************************************************************************************************************************************
    #generando un archivo para los anhos de health1
    ratings_health  = load_json(getpath_db(dbname) +  "ratings.json")
    years_health = {}
    #{"body": {"5988": [{"r": "2014", "o2": 39}
    for i in ratings_health["body"]:
      #print ("PANINI", i, ratings_health["body"][i])
      for j in xrange(0, len(ratings_health["body"][i])):
        ye = str(ratings_health["body"][i][j]["r"])
        if ye not in years_health:
          years_health[ye] = {}
        years_health[ye][i] = 1
    years_health = {"body": years_health}
    save_json(getpath_db(dbname) + "years.json", years_health)




    #this I added just to extract the List of dimension vectors
    lista = arr_tsne.tolist()
    nombres = np.array(dimensionsData["body"])
    nombres = nombres[:,0]
    nombres = nombres.tolist()
    lista_save = {"body": lista, "names": nombres}
    save_json(getpath_db(dbname) + "dimension_vector.json", lista_save)

    heatmap["body"] = heatmap["body"].tolist()
    save_json(getpath_db(dbname) + "heatmap.json", heatmap)

    print ("starting projection...")

        
    #Now the projection of All data
    time0 = time()
    model = TSNE(n_components = 2, random_state=0)
    np.set_printoptions(suppress=True)
    points = model.fit_transform(arr_tsne)
    points = np.matrix(points)
    points = points.tolist()
    time1 = time()
    print ("tsne-principal time", time1 - time0)
    for poi in xrange(0, len(points)):
      points[poi].append(dimensionsData["body"][poi][0])

    save_json(getpath_db(dbname) + "projection.json", points)
    
    #no deberia estar comentado, solo para generar el dimension vector
    """
    #procesing the projection by each dimension
    for i in xrange(0, len(arr_tsne[0])):
      time0 = time()
      model = TSNE(n_components = 2, random_state = 0)
      np.set_printoptions(suppress=True)
      pp = model.fit_transform(arr_tsne[:,[i]])
      pp = np.matrix(pp)
      pp = pp.tolist()
      for iii in xrange(0, len(pp)):
        pp[iii].append(dimensionsData["body"][iii][0])
      time1 = time()
      nadass = "time proj dim_" + str(i)
      print_message(nadass, time1 - time0)
      save_json(getpath_db(dbname) + "proj_" + str(i) + ".json",  pp)
    """
    self.write(json.dumps(""))

class save_and_generate_newData_buckup(BaseHandler):
  def post(self):
    mydata = json.loads(self.request.body)
    dbname = str(mydata.get("dbname"))
    details = mydata
    print ("mydata", dbname) 
    #generate details.json
    detailsjson = {"Dimensions_total": details["Dimensions_total"], "Dimensions_charts": [], "features": details["features"]}
    dimensionsData = load_json(getpath_db(dbname) + "dimensions.json")

    
    for dc in details["Dimensions_charts"]:
      if dc["t_var"] == "Categorical":
        #busqueda de todas las posibles categorias
        auxset = set()
        for di in dimensionsData["body"]:
          auxset.add(di[int(dc["idx"])])
        detailsjson["Dimensions_charts"].append({"name": dc["name"], "titles": list(auxset), "type_chart": dc["type_chart"]})
      else:
        if len(dc["dom"]) == 0:
          detailsjson["Dimensions_charts"].append({"name": dc["name"], "titles": [], "type_chart": dc["type_chart"]})     
        else:
          detailsjson["Dimensions_charts"].append({"name": dc["name"], "titles": dc["ran"], "type_chart": dc["type_chart"]})

    save_json(getpath_db(dbname) + "details.json", detailsjson)

    dataObj1 = load_json(getpath_db(dbname) + "object_1.json")

    """dataViz = {"dimensions": detailsjson["Dimensions_charts"], "instances": []}
    for i in xrange(0, len(dimensionsData["body"])):
      #aux = {"idx": i, "id": dimensionsData["body"][i][0], "name": dimensionsData["headers"][i], "values": []}
      aux = {}
      aux["idx"] = i
      aux["id"] = dimensionsData["body"][i][0]
      aux["n"] = dataObj1["body"][i][1]
      aux["values"] = []
      for j in  xrange(0, len(detailsjson["Dimensions_charts"])):
        jj = details["Dimensions_charts"][j]["idx"]
        if details["Dimensions_charts"][j]["t_var"] == "Categorical":
          ind = detailsjson["Dimensions_charts"][j]["titles"].index(dimensionsData["body"][i][jj])
          aux["values"].append(ind)
        else:
          for k in xrange(0, len(details["Dimensions_charts"][j]["dom"])):
            if k == 0 and int(dimensionsData["body"][i][jj]) < int(details["Dimensions_charts"][j]["dom"][k]):
              aux["values"].append(0)
            elif k == (len(details["Dimensions_charts"][j]["dom"])-1) and int(dimensionsData["body"][i][jj]) >= int(details["Dimensions_charts"][j]["dom"][k]):
              aux["values"].append(k+1)
            elif int(dimensionsData["body"][i][jj]) >= int(details["Dimensions_charts"][j]["dom"][k-1]) and int(dimensionsData["body"][i][jj]) < int(details["Dimensions_charts"][j]["dom"][k]):
              aux["values"].append(k)
      dataViz["instances"].append(aux) 

    
    save_json(getpath_db(dbname) + "dataViz.json", dataViz)
    """
    dataViz = load_json(getpath_db(dbname) + "dataViz.json")
    #now generate the heatmap and projection

    det_details = []
    iii = 0
    
    len_charts = len(detailsjson["Dimensions_charts"])

    for det in detailsjson["features"]:
      """if iii < len_charts:
        det_details.append([0, len(detailsjson["Dimensions_charts"][iii]["titles"])-1])
      elif det["type"] == "String":
        det_details.append([100000, -1000000])
      else:"""
      if det["detail"] == []:
        det_details.append([100000, -1000000])
      else:
        det_details.append(det["detail"])
      iii += 1

    
    len_charts = -1 
    for da in dimensionsData["body"]:
      for j in xrange(0, len(details["features"])):
        if j < len_charts:
          #continue
          algoasd = 0
        elif det["type"] == "String":
          #continue
          algoasd = 0
        else:
          if details["features"][j]["detail"] == []:
            det_details[j][0] = min(det_details[j][0], float(da[j+1]))
            det_details[j][1] = max(det_details[j][1], float(da[j+1]))

    #print("featuressssssssssssss", details["features"], len(details["features"]))
    #print("noooooooooooooooooooo", det_details, len(det_details))
    #here begin the t-sne algorithm with python
    arr_tsne = []
    heat_tsne = []
    ii = 0
    len_charts = -1
    for da in dimensionsData["body"]:
      aux = []
      aux_heat = []
      for i in  xrange(0, len(details["features"])):
        val = 0.0
        val_heat = 0.0
        if i < len_charts:
          print("if i<len_charts")
          ind = dataViz["instances"][ii]["values"][i]
          val = myscale(det_details[i][0], det_details[i][1], 0.0, 1.0, float(ind))
          val_heat = val
        elif detailsjson["features"][i]["type"] == "String":
          print("if string")
          ind = detailsjson["Dimensions_charts"][i]["titles"].index(da[i+1])
          val = myscale(det_details[i][0], det_details[i][1], 0.0, 1.0, float(ind))    
          val_heat = val
        else:
          #print ("nilaedad", da[i+1])
          #print ("asd", det_details[i], i)

          val = myscale(float(det_details[i][0]), float(det_details[i][1]), 0.0, 1.0, float(da[i+1]))    
          if float(da[i+1]) < float(det_details[i][0]):
            val_heat = -1
          else:
            val_heat = val
        if val < 0 or val > 1:
          print ("error limites tsne", det_details[i], da[i+1], ii, i)
        #print ("special", da, da[i+1])
        
        val = myformat_dec5(val)
        val_heat = myformat_dec5(val)
        aux.append(val)
        aux_heat.append(val_heat)

      arr_tsne.append(aux)
      heat_tsne.append(aux_heat)
      ii += 1

    arr_tsne2 = np.array(arr_tsne)

    heat_tsne2 = np.array(heat_tsne)
    heat_tsne2 = heat_tsne2.tolist()

    heatmap = {"headers": dimensionsData["headers"][1:], "body": heat_tsne2}
    save_json(getpath_db(dbname)+ "heatmap.json", heatmap)

    print("holisssssssssssssssss", arr_tsne2)
    

    #comentado por que demora mucho hacer la projection
    time0 = time()
    model = TSNE(n_components=2, random_state=0)
    np.set_printoptions(suppress=True)
    points = model.fit_transform(arr_tsne2)

    mptos = np.matrix(points)
    ptos = mptos.tolist()

    time1 = time()

    for ii in xrange(0, len(ptos)):
      ptos[ii].append(dimensionsData["body"][ii][0])   

    print ("tsne-principal time", time1 - time0)
    
    save_json(getpath_db(dbname) + "projection.json", ptos)  
    
    print ("pretending", arr_tsne2)

    #Here i will try get the projection by each dimension
    """print ("starting the tsne by each dimensions")
    for i in xrange(0, len(arr_tsne2[0])):
      time0 = time()
      model = TSNE(n_components = 2, random_state = 0)
      np.set_printoptions(suppress=True)
      pp = model.fit_transform(arr_tsne2[:,[i]])
      ptt = np.matrix(pp)
      ptt = ptt.tolist()
      for iii in xrange(0, len(ptt)):
        ptt[iii].append(dimensionsData["body"][iii][0])
      time1 = time()
      nadass = "time proj dim_" + str(i)
      print_message(nadass, time1 - time0)
      save_json(getpath_db(dbname) + "proj_" + str(i) + ".json",  ptt)
    """
    print ("aqui acaba")
    self.write(json.dumps(""))

# Class for Google authentication
class GoogleOAuth2LoginHandler(tornado.web.RequestHandler, tornado.auth.GoogleOAuth2Mixin):
  @tornado.gen.coroutine
  def get(self):
    if self.get_argument('code', False):
      access = yield self.get_authenticated_user(
        redirect_uri = 'http://' + self.request.host + self.request.path,
        code = self.get_argument('code'))
      user = yield self.oauth2_request(
        "https://www.googleapis.com/oauth2/v1/userinfo",
        access_token = access["access_token"])
      self.set_secure_cookie("token", access["id_token"])
      self.set_secure_cookie("id", user["id"])
      self.set_secure_cookie("given_name", user["given_name"])
      self.set_secure_cookie("family_name", user["family_name"])
      self.set_secure_cookie("email", user["email"])
      self.set_secure_cookie("picture", user["picture"])
      self.set_secure_cookie("locale", user["locale"])
      self.redirect('/')
    else:
      yield self.authorize_redirect(
        redirect_uri = 'http://' + self.request.host + self.request.path,
        client_id = self.settings['google_oauth']['key'],
        scope = ['profile', 'email'],
        response_type = 'code',
        extra_params = {'approval_prompt': 'auto'})

class start_new_template_Viz(BaseHandler):
  def get(self):
    dbname = self.get_argument("g")
    self.render('vexus2.html', current_group=dbname)

class get_data_projection(BaseHandler):
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

class getData_Viz(BaseHandler):
  def post(self):
    mydata = json.loads(self.request.body)
    dbname = mydata.get("dbname")
    path = getpath_db(dbname) + "dataViz.json"
    
    time0 = time()
    data_viz = load_json(path)
    time1 = time()
    #print_message("getData_Viz", time1 - time0)
    time0 = time()
    res = {"dimensions": data_viz["dimensions"], "instances": []}
    data_selected = mydata.get("data_selected")
    for ds in data_selected:
      res["instances"].append(data_viz["instances"][ds])
    time1 = time()


    #print ("mydata", mydata)
    # if original_group exist => we are going to calculate the KL-divergence between the two heatmaps
    if "original_group" in mydata:
      print ("existe original_group")

    print_message("getData_Viz", time1 - time0)    

    self.write(json.dumps(res))

class getDataObj2_table(BaseHandler):
  def post(self):
    mydata = json.loads(self.request.body)
    dbname = mydata.get("dbname")
    data_selected = mydata.get("data_selected")#this data is a array of Objects_1 IDs
    
    path = "static/data/" + dbname + "/"
    time0 = time()
    
    data_ratings = []
    if dbname == "Movielens only Rating":
      data_ratings = copy.copy(ratings_movielens)
    else:
      data_ratings = load_json(path + "ratings.json")
    time1 = time()
    print_message("load ratings.json", time1 - time0)

    time0 = time()
    data_obj2 = load_json(path + "object_2.json")
    time1 = time()
    print_message("load object_2.json", time1 - time0)

    time0 = time()
    
    headers = []
    if(dbname == "health1"):
      headers = [data_obj2["headers"][0], data_obj2["headers"][1], "Year"]
    else:
      headers = [data_obj2["headers"][0], data_obj2["headers"][1], "Rating"]

    for x in xrange(2, len(data_obj2["headers"])):
      headers.append(data_obj2["headers"][x])

    obj2 = {"headers": headers, "body": {}}

    #for timechart health1
    yy = {}

    for ds in data_selected:
      aux_yy = {}
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

        #for timechart health1
        if dbname == "health1":
          anho = str(dr["r"])
          if anho not in aux_yy:
            aux_yy[anho] = 1
            if anho not in yy:
              yy[anho] = 1
            else:
              yy[anho] += 1

    for oo in obj2["body"]:
      if dbname == "health1":
        obj2["body"][oo]["dat"][2] = int(round(obj2["body"][oo]["dat"][2]/float(obj2["body"][oo]["len"])))
      else:  
        obj2["body"][oo]["dat"][2] = myformat_dec(obj2["body"][oo]["dat"][2]/float(obj2["body"][oo]["len"]))
      #obj2["body"][oo]["dat"].append(obj2["body"][oo]["len"])

    #for timechart health1
    yyy = []
    for y in yy:
      yyy.append({"year":y,"freq":yy[y],"ef":1})
    yyy = sorted(yyy, key=getKey_byYear)
    obj2["years"] = yyy


    time1 = time()
    print_message("getDataObj2_table", time1 - time0)

    self.write(json.dumps(obj2)) 

class get_heatmap(BaseHandler):
  def post(self):
    mydata = json.loads(self.request.body)
    dbname = mydata.get("dbname")
    data_selected = mydata.get("data_selected")

    time0 = time()
    data_dim = []
    if dbname == "Movielens only Rating":
      data_dim = copy.copy(heatmap_movielens)
    else:
      data_dim = load_json(getpath_db(dbname) + "heatmap.json")

    data_ori_dim = load_json(getpath_db(dbname) + "dimensions.json")

    res = {"headers": data_dim["headers"], "body": [], "ori": []}
    for uu in data_selected:
      res["body"].append(data_dim["body"][uu])
      res["ori"].append(data_ori_dim["body"][uu])
    time1 = time()
    print_message("get_heatmap", time1 - time0)

    self.write(json.dumps(res))


class getDimension_legend(BaseHandler):
  def post(self):
    mydata = json.loads(self.request.body)
    dbname = mydata.get("dbname")
    
    #the dim_num begin with zero( 0 ) 
    dim_num = mydata.get("dimension_num")
    dim_num = int(dim_num)


    colors = ["#e6194b", "#3cb44b", "#ffe119", "#0082c8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#d2f53c", "#fabebe", "#008080", "#e6beff", "#aa6e28", "#800000", "#aaffc3", "#808000", "#ffd8b1", "#000080", "#b15928", "#6a3d9a", "#33a02c"]                    

    time0 = time()
    data_heatmap = []
    if dbname == "Movielens only Rating":
      data_heatmap = copy.copy(heatmap_movielens)
    else:
      data_heatmap = load_json(getpath_db(dbname) + "heatmap.json")
    details = load_json(getpath_db(dbname) + "details.json")
    dataViz = load_json(getpath_db(dbname) + "dataViz.json")

    res = {"selector": "#areaMainsvg_projection", "title": "", "hasChecks": 1, "body": []}
    #Charts Dimensions
    aux_body = []
    
    if dim_num < len(details["Dimensions_charts"]):
      res["mode"] = "static"
      res["names"] = details["Dimensions_charts"][dim_num]["titles"]
      res["colors"] = colors[0:len(details["Dimensions_charts"][dim_num]["titles"])]
      res["title"] = details["Dimensions_charts"][dim_num]["name"]

      sz_dim = float(len(details["Dimensions_charts"][dim_num]["titles"]) - 1.0)
      for i_dataviz in xrange(0, len(dataViz["instances"])):
        aux_body.append(dataViz["instances"][i_dataviz]["values"][dim_num]/sz_dim)
    else:
      dim_num_heat = dim_num - len(details["Dimensions_charts"]) + len(details["dim_toProj"])
      res["title"] = data_heatmap["headers"][dim_num_heat]
      res["mode"] = "dynamic"
      res["names"] = ["Min", "Max"]     
      res["colors"] = ['#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58']

      for d_body in data_heatmap["body"]:
        aux_body.append(d_body[dim_num_heat])
      
    if dbname == "Movielens only Rating" and dim_num == 4:
      res["brightness"] = dataViz["brillo"]
    if dbname == "health1" and dim_num == 3:
      res["brightness"] = dataViz["brillo"]
    if dbname == "NewBookCrossing" and dim_num == 2:
      res["brightness"] = dataViz["brillo"]

    res["body"] = aux_body


    time1 = time()
    print_message("getDimension_legend", time1 - time0)

    self.write(json.dumps(res))

class getDimension_legend_buckup(BaseHandler):
  def post(self):
    mydata = json.loads(self.request.body)
    dbname = mydata.get("dbname")
    dim_num = mydata.get("dimension_num")
    select = mydata.get("select")
    print ("ssss", select, dim_num)
    colors = ["#e6194b", "#3cb44b", "#ffe119", "#0082c8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#d2f53c", "#fabebe", "#008080", "#e6beff", "#aa6e28", "#800000", "#aaffc3", "#808000", "#ffd8b1", "#000080", "#b15928", "#6a3d9a", "#33a02c"]                    

    time0 = time()

    data = load_json(getpath_db(dbname) + "heatmap.json")
    details = load_json(getpath_db(dbname) + "details.json")
    obj1 = load_json(getpath_db(dbname) + "object_1.json")
    res = {"selector": "#areaMainsvg_projection", "title": "", "hasChecks": 1, "body": []}
    dddd = []
    if len(details["Dimensions_charts"]) > dim_num:
      res["mode"] = "static"
      res["names"] = details["Dimensions_charts"][dim_num]["titles"]
      res["colors"] = colors[0:len(details["Dimensions_charts"][dim_num]["titles"])]

      
      if dim_num == 0:#gender
        res["title"] = "Gender"
        for i in xrange(0, len(obj1["body"])):
          if obj1["body"][i][2] == "F":
            dddd.append(0)
          else:
            dddd.append(1)
      elif dim_num == 1:
        res["title"] = "Age"
        for i in xrange(0, len(obj1["body"])):
          if obj1["body"][i][3] == "1":
            dddd.append(0)
          elif obj1["body"][i][3] == "18":
            dddd.append(1/6.0)
          elif obj1["body"][i][3] == "25":
            dddd.append(2/6.0)
          elif obj1["body"][i][3] == "35":
            dddd.append(3/6.0)
          elif obj1["body"][i][3] == "45":
            dddd.append(4/6.0)
          elif obj1["body"][i][3] == "50":
            dddd.append(5/6.0)
          elif obj1["body"][i][3] == "56":
            dddd.append(6/6.0)
      elif dim_num == 2:
        res["title"] = "Occupation"
        for i in xrange(0, len(obj1["body"])):
          ggg = int(obj1["body"][i][4]) * (1/20.0)
          dddd.append(ggg)

    else:
      res["title"] = data["headers"][dim_num-3]
      res["mode"] = "dynamic"
      res["names"] = ["Min", "Max"]
      res["colors"] = ['#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58']#['#ffffb2','#fecc5c','#fd8d3c','#f03b20','#bd0026']
      for dd in data["body"]:
        dddd.append(dd[dim_num-3])  

    res["body"] = dddd
    """if select == "all":
      for dd in data["body"]:
        res["body"].append(dd[dim_num])  
    else:
      for ss in select:
        res["body"].append(data["body"][ss][dim_num])
    """
    hh = res["body"][:]
    hh = sorted(hh)
    sz = len(hh)
    med = math.floor(sz/2)
    medd = hh[int(med)]
    q1 = hh[int(med - math.floor(med/2))]
    q3 = hh[int(med + math.floor(med/2))]    
    iqr = q3 - q1
    lim = iqr * 0.9

    res["outlier"] = [medd, q1, q3, lim]

    time1 = time()
    print_message("getDimension_legend", time1 - time0)

    self.write(json.dumps(res))
    
class get_Details_options(BaseHandler):
  def post(self):
    mydata = json.loads(self.request.body)
    dbname = mydata.get("dbname")
    data_details = load_json(getpath_db(dbname) + "details.json")
    res = {"charts": [], "dimensions": [], "intersection": []}
    for dc in data_details["Dimensions_charts"]:
      res["charts"].append({"name": dc["name"]})
    for i in xrange(0, len(data_details["dim_toProj"])):
      res["intersection"].append({"name": data_details["Dimensions_total"][i]["name"]})
    for i in xrange(len(data_details["dim_toProj"]), len(data_details["Dimensions_total"])):
      res["dimensions"].append({"name": data_details["Dimensions_total"][i]["name"]})
    
    self.write(json.dumps(res))

class getNewGroups(BaseHandler):
  def post(self):
    mydata = json.loads(self.request.body)
    dbname = mydata.get("dbname")
    data_selected = mydata.get("data_selected")
    k = mydata.get("K")
    P = mydata.get("P")
    simi = mydata.get("type_simi")
    

    #dataset = heatmap with the complete matrix normalized
    time0 = time()
    
    dataset = []
    if dbname == "Movielens only Rating":
      dataset = copy.copy(heatmap_movielens)
    else:
      dataset = load_json(getpath_db(dbname) + "heatmap.json")

    dataset = dataset["body"]
    time1 = time()
    print_message("load heatmap.json", time1 - time0)
    #comentado porque se esta usando el algoritmo con escolha aleatoria para grupos
    #del mismo tamanho
    """
    #dimensionFull = File with dimensions not normalized, brute state
    time0 = time()
    dimensionsFull = load_json(getpath_db(dbname) + "dimensions.json")
    time1 = time()
    print_message("load full_dimensions.json", time1 - time0)

    #features = the details of the data dimensions
    time0 = time()
    features = load_json(getpath_db(dbname) + "details.json")
    #features = features["features"]
    time1 = time()
    print_message("load detais.json", time1 - time0)

    #dataViz
    time0 = time()
    dataViz = load_json(getpath_db(dbname) + "dataViz.json")
    time1 = time()
    print_message("load dataViz.json", time1 - time0)
    """
    #My algorithm
    time0 = time()
    #res = my_algorithm.generate(dataset, data_selected, k, dimensionsFull, features, dataViz)#I want 5 new groups
    res = my_algorithm.generate_groups(dataset, data_selected, k, P, simi)
    time1 = time()
    print_message("getNewGroups", time1 - time0)

    print ("paso el algoritmo")
    res = my_algorithm.process_similarity(dataset, res, data_selected)
    #print ("\n\n\ntermino similitud", res)
    self.write(json.dumps(res))


class getOtherProj(BaseHandler):
  def post(self):
    mydata = json.loads(self.request.body)
    dbname = mydata.get("dbname")
    idx = mydata.get("dim")
    res = []
    time0 = time()
    if idx == -1:
      res = load_json(getpath_db(dbname) +  "projection.json")
    else:
      res = load_json(getpath_db(dbname) +  "proj_" + str(idx) + ".json")
    time1 = time()
    print_message("getOtherProj", time1 - time0)

    self.write(json.dumps(res))


class getUsersbyRangeYear(BaseHandler):
  def post(self):
    mydata = json.loads(self.request.body)
    dbname = mydata.get("dbname")
    data_selected = mydata.get("data_selected")
    years_selected = mydata.get("years_selected")

    years = load_json(getpath_db(dbname) + "years.json")
    #print years["body"]["1986"]
    res = {}
    for y in years_selected:
      for us in data_selected:
        if us in years["body"][y]:
          res["name"+us] = 1

    self.write(json.dumps(res))

class getNroUsersbyConcept(BaseHandler):
  def post(self):
    mydata = json.loads(self.request.body)
    dbname = mydata.get("dbname")
    data_selected = mydata.get("data_selected")

    data_ratings = load_json(getpath_db(dbname) + "ratings.json")

    #//data = [{"year": "1", "freq": "12", "enfalso": 1}, {"year": "2", "freq": "45", "enfalso": 1}]
    yy = {}

    for ds in data_selected:
      aux_yy = {}
      for dr in data_ratings["body"][str(ds)]:
        #for timechart health1
        anho = str(dr["r"])
        if anho not in aux_yy:
          aux_yy[anho] = 1
          if anho not in yy:
            yy[anho] = 1
          else:
            yy[anho] += 1

    #for timechart health1
    yyy = []
    for y in yy:
      yyy.append({"year":y,"freq":yy[y],"ef":1})
    yyy = sorted(yyy, key=getKey_byYear)
    self.write(json.dumps(yyy))

class getDataObj2_and_concepts(BaseHandler):
  def post(self):
    mydata = json.loads(self.request.body)
    dbname = mydata.get("dbname")
    data_selected = mydata.get("data_selected")#this data is a array of Objects_1 IDs
    #concepts_selected = mydata.get("concepts_selected")

    path = "static/data/" + dbname + "/"
    time0 = time()

    data_ratings = []
    if dbname == "Movielens only Rating":
      data_ratings = copy.copy(ratings_movielens)
    else:
      data_ratings = load_json(path + "ratings.json")
    time1 = time()
    print_message("load ratings.json", time1 - time0)

    time0 = time()
    data_obj2 = load_json(path + "object_2.json")
    time1 = time()
    print_message("load object_2.json", time1 - time0)

    time0 = time()

    headers = []
    if(dbname == "health1"):
      headers = [data_obj2["headers"][0], data_obj2["headers"][1], "Year"]
    else:
      headers = [data_obj2["headers"][0], data_obj2["headers"][1], "Rating"]

    for x in xrange(2, len(data_obj2["headers"])):
      headers.append(data_obj2["headers"][x])

    obj2 = {"headers": headers, "body": {}}

    #for timechart health1
    yy = {}

    for ds in data_selected:
      aux_yy = {}
      for dr in data_ratings["body"][str(ds)]:
        #for timechart health1
        anho = str(dr["r"])
        if anho not in aux_yy:
          aux_yy[anho] = 1
          if anho not in yy:
            yy[anho] = 1
          else:
            yy[anho] += 1

    
    if ("concepts_selected" in mydata):
      print ("miraflores1", yy, mydata["concepts_selected"])
      concepts_selected = mydata.get("concepts_selected")
      if len(concepts_selected) > 0:
        yy = concepts_selected

    print ("miraflores111", yy)

    for ds in data_selected:
      for dr in data_ratings["body"][str(ds)]:
        idx = dr["o2"]
        if dr["r"] in yy:         
          if not str(idx) in obj2["body"]:
            aux = [data_obj2["body"][idx][0], data_obj2["body"][idx][1], int(dr["r"])]
            for x in xrange(2, len(data_obj2["headers"])):
              aux.append(data_obj2["body"][idx][x])
            obj2["body"][str(idx)] = {"dat": aux, "len": 1}
          else:
            obj2["body"][str(idx)]["dat"][2] += int(dr["r"])
            obj2["body"][str(idx)]["len"] += 1;

        
    for oo in obj2["body"]:
      if dbname == "health1":
        obj2["body"][oo]["dat"][2] = int(round(obj2["body"][oo]["dat"][2]/float(obj2["body"][oo]["len"])))
      else:  
        obj2["body"][oo]["dat"][2] = myformat_dec(obj2["body"][oo]["dat"][2]/float(obj2["body"][oo]["len"]))
      #obj2["body"][oo]["dat"].append(obj2["body"][oo]["len"])

    #for timechart health1
    yyy = []
    for y in yy:
      yyy.append({"year":y,"freq":yy[y],"ef":1})
    yyy = sorted(yyy, key=getKey_byYear)
    obj2["years"] = yyy


    time1 = time()
    print_message("getDataObj2_table", time1 - time0)

    self.write(json.dumps(obj2))    

####  END  #### MY CLASSES ###################

### functions for support START ###############
def getKey_byYear(item):
  return item["year"]


def isNumber(str):
  res = 0
  for d in str:
    if (d >= 'a' and d <= 'z') or (d >= 'A' and d <= 'Z'):
      return False
    if d >= '0' and d <= '9':
      res += 1
  return res >= (len(str)-1)


def kl_divergence(histo_1, histo_2):
  n = len(histo_1)
  res = 0
  for i in xrange(0, n):
    aux   = float(histo_1[i]) / float(histo_2[i])
    aux2  = math.log10(aux) 
    res += (histo_1[i] * aux2)
  return res

def print_message(label, mess):
  print "***************************"
  print "Time de %s : %s" % (label, mess)
  print "**************************"

def save_json(path, data):
  with open( path , "w") as outfile:
    json.dump(data, outfile)      

def myformat_dec(x):
  hh = ('%.2f' % x).rstrip('0').rstrip('.')
  return float(hh)

def myformat_dec5(x):
  hh = ('%.2f' % x).rstrip('0').rstrip('.')
  return float(hh)

def myscale2(old_min, old_max, new_min, new_max, old_value):
  return ( (old_value - old_min) / (old_max - old_min) ) * (new_max - new_min) + new_min 

def myscale(old_min, old_max, new_min, new_max, old_value, sin_detail):  
  if sin_detail:
    if old_value > old_max:
      old_value = old_max
    if old_value < old_min:
      old_value = old_min
    return ( (old_value - old_min) / (old_max - old_min) ) * (new_max - new_min) + new_min 
  return ( (old_value - old_min) / (old_max - old_min) ) * (new_max - new_min) + new_min 

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
  while lower <= upper:   # use < instead of <=
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
  debug = True,
  google_oauth = {"key": "299815581530-s2rcg6jr3kg1maom42p9c1eqs6otnf1b.apps.googleusercontent.com", "secret": "W2Jg6Za1wAthcfHotWa2h5nK"},
  developers = ["goesrex@gmail.com", "fbcolque@gmail.com", "joao.comba@gmail.com"]
)    

application = tornado.web.Application([
  (r"/", MainHandler),
  (r"/save_new_dataset_configuration", save_new_dataset_configuration),
  (r"/recover_name_datasets", recover_name_datasets),
  (r"/get_data_projection", get_data_projection),
  (r"/auth/google", GoogleOAuth2LoginHandler),
  (r"/vexus2", start_new_template_Viz),
  (r"/getData_Viz", getData_Viz),
  (r"/getDataObj2_table", getDataObj2_table),
  (r"/get_heatmap", get_heatmap),
  (r"/getDimension_legend", getDimension_legend),
  (r"/get_Details_options", get_Details_options),
  (r"/getNewGroups", getNewGroups),
  (r"/save_and_generate_newData", save_and_generate_newData),
  (r"/getOtherProj", getOtherProj),
  (r"/getUsersbyRangeYear", getUsersbyRangeYear),
  (r"/getNroUsersbyConcept", getNroUsersbyConcept),
  (r"/getDataObj2_and_concepts", getDataObj2_and_concepts),
  (r"/is_developer", is_developer),
  (r"/is_load_spreadsheet", is_load_spreadsheet),
  (r"/get_email", get_email),
  (r"/certified_user", certified_user),
  (r"/register_user", register_user),
  (r"/end_tour", end_tour),
  (r"/start_user", start_user),
  (r"/end_user", end_user),
  (r"/start_form", start_form),
  (r"/end_form", end_form),
  (r"/(.*)", tornado.web.StaticFileHandler, {'path' : './static/', 'default_filename': 'index.html'})
  ], cookie_secret = "9a1d9181811cae798768a4f3c0d8fe3d", **settings)


if __name__ == "__main__":
  print "Starting ..."
  global heatmap_movielens
  heatmap_movielens = load_json("static/data/Movielens only Rating/heatmap.json")
  global ratings_movielens
  ratings_movielens = load_json("static/data/Movielens only Rating/ratings.json")
  print "Server running ..."

  application.listen(8888)
  tornado.ioloop.IOLoop.instance().start()

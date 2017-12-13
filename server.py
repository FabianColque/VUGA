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
class recover_name_datasets(tornado.web.RequestHandler):
  def post(self):
    path = "static/data/"
    dir_list = os.listdir(path)
    self.write(json.dumps(dir_list))    


#This class save and generate the new files as dataViz and details .json
class save_and_generate_newData(tornado.web.RequestHandler):
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

    dataViz = {"dimensions": detailsjson["Dimensions_charts"], "instances": []}
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
              aux["values"].append(k)
            elif int(dimensionsData["body"][i][jj]) >= int(details["Dimensions_charts"][j]["dom"][k-1]) and int(dimensionsData["body"][i][jj]) < int(details["Dimensions_charts"][j]["dom"][k]):
              aux["values"].append(k)
      dataViz["instances"].append(aux) 

    
    save_json(getpath_db(dbname) + "dataViz.json", dataViz)

    #now generate the heatmap and projection

    det_details = []
    iii = 0
    
    len_charts = len(detailsjson["Dimensions_charts"])

    for det in detailsjson["features"]:
      if iii < len_charts:
        det_details.append([0, len(detailsjson["Dimensions_charts"][iii]["titles"])-1])
      elif det["type"] == "String":
        det_details.append([100000, -1000000])
      else:
        if det["detail"] == []:
          det_details.append([100000, -1000000])
        else:
          det_details.append(det["detail"])
      iii += 1

    

    for da in dimensionsData["body"]:
      for j in xrange(0, len(details["features"])):
        if j < len_charts:
          continue
        elif det["type"] == "String":
          continue
        else:
          if details["features"][j]["detail"] == []:
            det_details[j][0] = min(det_details[j][0], float(da[j+1]))
            det_details[j][1] = max(det_details[j][1], float(da[j+1]))

    
    #here begin the t-sne algorithm with python
    arr_tsne = []
    heat_tsne = []
    ii = 0
    for da in dimensionsData["body"]:
      aux = []
      aux_heat = []
      for i in  xrange(0, len(details["features"])):
        val = 0.0
        val_heat = 0.0
        if i < len_charts:
          ind = dataViz["instances"][ii]["values"][i]
          val = myscale(det_details[i][0], det_details[i][1], 0.0, 1.0, float(ind))
          val_heat = val
        elif detailsjson["features"][i]["type"] == "String":
          ind = detailsjson["Dimensions_charts"][i]["titles"].index(da[i+1])
          val = myscale(det_details[i][0], det_details[i][1], 0.0, 1.0, float(ind))    
          val_heat = val
        else:
          #print ("nilaedad", da[i+1], det_details[i])
          val = myscale(float(det_details[i][0]), float(det_details[i][1]), 0.0, 1.0, float(da[i+1]))    
          if float(da[i+1]) < float(det_details[i][0]):
            val_heat = -1
          else:
            val_heat = val
        if val < 0 or val > 1:
          print ("error limites tsne", det_details[i], da[i+1])
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
    print ("starting the tsne by each dimensions")
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




    print ("aqui acaba")
    self.write(json.dumps(""))



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


    print ("mydata", mydata)
    # if original_group exist => we are going to calculate the KL-divergence between the two heatmaps
    if "original_group" in mydata:
      print ("existe original_group")

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
    k = mydata.get("K")
    
    #dataset = heatmap with the complete matrix normalized
    time0 = time()
    dataset = load_json(getpath_db(dbname) + "heatmap.json")
    dataset = dataset["body"]
    time1 = time()
    print_message("load heatmap.json", time1 - time0)

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

    #My algorithm
    time0 = time()
    res = my_algorithm.generate(dataset, data_selected, k, dimensionsFull, features, dataViz)#I want 5 new groups
    time1 = time()
    print_message("algorithm vexus2", time1 - time0)

    #print ("que nuevos grupos", res)
    res = my_algorithm.process_similarity(dataset, res, data_selected)
    #print ("termino similitud", res)
    self.write(json.dumps(res))


class getOtherProj(tornado.web.RequestHandler):
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
    print_message("get_data_projection_by_dim", time1 - time0)

    self.write(json.dumps(res))

####  END  #### MY CLASSES ###################

### functions for support START ###############

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

def myscale(old_min, old_max, new_min, new_max, old_value):
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
  (r"/save_and_generate_newData", save_and_generate_newData),
  (r"/getOtherProj", getOtherProj),
  (r"/(.*)", tornado.web.StaticFileHandler, {'path' : './static', 'dafault_filename': 'index.html'})
  ], **settings)


if __name__ == "__main__":
  print "Server running ..."
  application.listen(8888)
  tornado.ioloop.IOLoop.instance().start()
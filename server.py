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
    details = json.loads(self.request.body)
    dbname = str(details.get("dbname"))
    
    #Genering the details.json
    detailsjson = {"Dimensions_total": details["Dimensions_total"], "Dimensions_charts": [], "features": details["features"], "dim_toProj": []}     
    dimensionsData = load_json(getpath_db(dbname) + "dimensions.json")

    dataObj1 = load_json(getpath_db(dbname) + "object_1.json")

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
        for di in dataObj1["body"]:
          auxset.add(di[ite+2])
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
        if details["Dimensions_charts"][i_dim]["t_var"] == "Categorical":
          #print ("donde esyou", i_body, i_dim_obj, dataViz["dimensions"][i_dim]["titles"])
          i_aux = dataViz["dimensions"][i_dim]["titles"].index(dataObj1["body"][i_body][i_dim_obj])
          aux["values"].append(i_aux)
        else:
          for i_dom in xrange(0, len(details["Dimensions_charts"][i_dim]["dom"])):
            if i_dom == 0 and int(dataObj1["body"][i_body][i_dim+2]) < int(details["Dimensions_charts"][i_dim]["dom"][i_dom]):
              aux["values"].append(0)
            elif i_dom == (len(details["Dimensions_charts"][i_dim]["dom"])-1) and int(dataObj1["body"][i_body][i_dim+2]) >= int(details["Dimensions_charts"][i_dim]["dom"][i_dom]):
              aux["values"].append(i_dom+1)
            elif int(dataObj1["body"][i_body][i_dim+2]) >= int(details["Dimensions_charts"][i_dim]["dom"][i_dom-1]) and int(dataObj1["body"][i_body][i_dim+2]) < int(details["Dimensions_charts"][i_dim]["dom"][i_dom]):
              aux["values"].append(i_dom)
      dataViz["instances"].append(aux)
    save_json(getpath_db(dbname) + "dataViz.json", dataViz)       

    #Generate the heatmap and projection

    details_limits = []
    i_aux = 0
    len_charts_proj = len(dimen_proj)

    for ftr in detailsjson["features"]:
      if i_aux < len_charts_proj:
        #if we have some chart Dimension as projection dimension 
        details_limits.append([0, len(detailsjson["Dimensions_charts"][dimen_proj[i_aux]]["titles"])-1])
      elif ftr["type"] == "String":
        details_limits.append([100000, -100000])
      else:
        if ftr["detail"] == []:
          details_limits.append([100000, -100000])
        else:
          details_limits.append(ftr["detail"])
      i_aux += 1

    for d_d in dimensionsData["body"]:
      for i_ftr in xrange(0, len(details["features"])):
        if i_ftr > len_charts_proj and details["features"][i_ftr]["detail"] == []:
          d_d[i_ftr + 1] = float(d_d[i_ftr + 1])
          details_limits[i_ftr][0] = min(details_limits[i_ftr][0], d_d[i_ftr+1])
          details_limits[i_ftr][1] = max(details_limits[i_ftr][1], d_d[i_ftr+1])

    #comvert the matrix in numpy matrix
    dimensionsData["body"] = np.array(dimensionsData["body"])

    #calculating the percentiles for the normalization
    for i_ftr in xrange(0, len(details["features"])):
      arraynp_aux = np.array(dimensionsData["body"][:, i_ftr+1], dtype=float)
      if i_ftr > len_charts_proj and details["features"][i_ftr]["detail"] != []:
        details_limits[i_ftr][0] = np.min(arraynp_aux)
        details_limits[i_ftr][1] = np.max(arraynp_aux)
      if i_ftr > len_charts_proj and details["features"][i_ftr]["detail"] == []:
        q1 = scoreatpercentile(arraynp_aux, 25)
        q3 = scoreatpercentile(arraynp_aux, 75)
        iqd = q3 - q1
        md = np.median(arraynp_aux)
        whisker = 1.5*iqd
        details_limits[i_ftr] = [md - whisker, md + whisker]

    #here we are going to use the t-sne to project the data
    arr_tsne = []
    heatmap_tsne = []

    i_body = 0
    for body in dimensionsData["body"]:
      aux = []
      aux_heat = []
      for i_ftr in xrange(0, len(details["features"])):
        val = 0.0
        val_heat = 0.0
        if i_ftr < len_charts_proj:
          val_aux = dataViz["instances"][i_body]["values"][dimen_proj[i_ftr]]
          val = myscale(details_limits[i_ftr][0], details_limits[i_ftr][1], 0.0, 1.0, float(val_aux), False)
          val_heat = val
        elif detailsjson["features"][i_ftr]["type"] == "String":
          val_aux = detailsjson["Dimensions_charts"][i_ftr]["titles"].index(body[i+1])
          val = myscale(details_limits[i_ftr][0], details_limits[i_ftr][1], 0.0, 1.0, float(val_aux), False)
          val_heat = val
        else:
          if details["features"][i_ftr]["detail"] == []:
            val = myscale(float(details_limits[i_ftr][0]), float(details_limits[i_ftr][1]), 0.0, 1.0, float(body[i_ftr+1]), True)
            if float(body[i_ftr+1]) < float(details_limits[i_ftr][0]):
              val_heat = 0.0
            elif float(body[i_ftr+1]) > float(details_limits[i_ftr][1]):
              val_heat = 1.0
            else:
              val_heat = val
          else:
            val = myscale(float(details_limits[i_ftr][0]), float(details_limits[i_ftr][1]), 0.0, 1.0, float(body[i_ftr+1]), False)
            if float(body[i_ftr+1]) < float(details["features"][i_ftr]["detail"][0]) or float(body[i_ftr+1]) > float(details["features"][i_ftr]["detail"][1]):
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

    heatmap = {"header": dimensionsData["headers"][1:], "body": heatmap_tsne}
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

    self.write(json.dumps(""))






class save_and_generate_newData_buckup(tornado.web.RequestHandler):
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


    #print ("mydata", mydata)
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
      #obj2["body"][oo]["dat"].append(obj2["body"][oo]["len"])
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
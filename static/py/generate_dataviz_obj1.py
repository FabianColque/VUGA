import json
import simplejson
import csv
import numpy as np

class MyError(Exception):
  def __init__(self, value):
    self.value = value
  def __str__(self):
    return repr(self.value)

#This code is for generate the dataViz of BX

def generate():
  data = load_json("../data/BookCrossing/object_1.json")
  data.pop(0)
  #data = sorted(data)
  #print data[0]
  res = {"dimensions": [
    {"name": "Age", "type_chart": "Bar Chart", "titles": ["Under 18", "18-24", "25-34", "35-44", "45-49", "50-55", "56+"]}
  ], "instances" : []}


  edades = {"1" : 0, "18": 1, "25": 2, "35": 3, "45": 4, "50": 5, "56": 6}

  for i in xrange(0, len(data)):
    aux = {"idx": i, "id": data[i][0],"n": data[i][1], "values": []}
    for x in xrange(3, 4):
      if x == 3:#Age
        ind = getpos_age(data[i][x])
        aux["values"].append(ind)
      else:
        print 'algo esta mal'
    res["instances"].append(aux)
  #print res

  try:
    jsondata  = simplejson.dumps(res)
    namejson = "../data/BookCrossing/dataViz.json"
    fd = open(namejson, "w")
    fd.write(jsondata)
    fd.close()
  except MyError as e:
    print "Error with generate dataviz to BookCrossing"

def getpos_age(ag):
  ag = int(ag)
  if ag < 18:
    return 0
  elif ag >= 18 and ag <= 24:
    return 1
  elif ag >= 25 and ag <= 34:
    return 2
  elif ag >= 35 and ag <= 44:
    return 3
  elif ag >= 45 and ag <= 49:
    return 4
  elif ag >= 50 and ag <= 55:
    return 5
  elif ag >= 56:
    return 6
  else:
    print "error en getpos_age dataviz"

def load_json(path):
  dataori = []
  with open(path) as data_file:
    dataori = json.load(data_file)
  return dataori

generate()


"""

#This code is for generate the dataViz of Movielens

def generate():
  data = load_json("../data/Movielens/object_1.json")
  data.pop(0)
  data = sorted(data)
  #print data

  res = {"dimensions": [
    {"name": "gender", "type_chart": "Pie Chart", "titles": ["F", "M"]},
    {"name": "Age", "type_chart": "Bar Chart", "titles": ["Under 18", "18-24", "25-34", "35-44", "45-49", "50-55", "56+"]},
    {"name": "Ocupation", "type_chart": "Bar Chart", "titles": ["other","academic/educator","artist","clerical/admin","college/grad_student","customer_service","doctor/health_care","executive/managerial","farmer","homemaker","K-12_student","lawyer","programmer","retired","sales/marketing","scientist","self-employed","technician/enginner","tradesman/craftsman","unemployed","writer"]},
  ], "instances" : []}


  edades = {"1" : 0, "18": 1, "25": 2, "35": 3, "45": 4, "50": 5, "56": 6}
  ocupaciones = {"0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, "11": 11, "12": 12, "13": 13, "14": 14, "15": 15, "16": 16, "17": 17, "18": 18, "19": 19, "20": 20}      

  for i in xrange(0, len(data)):
    aux = {"idx": i, "id": data[i][0],"n": data[i][1], "values": []}
    for x in xrange(2, 5):
      if x == 2:#gender
        if data[i][x] == 'F':
          aux["values"].append(0)
        else:
          aux["values"].append(1)
      elif x == 3:#Age
        if data[i][x] in edades:
          aux["values"].append(edades[data[i][x]])
        else:
          aux["values"].append(6)
      elif x == 4:#Ocupation
        if data[i][x] in ocupaciones:
          aux["values"].append(ocupaciones[data[i][x]])
        else:
          aux["values"].append(20)
      else:
        print 'algo esta mal'
    res["instances"].append(aux)
  #print res

  try:
    jsondata  = simplejson.dumps(res)
    namejson = "../data/Movielens/dataViz.json"
    fd = open(namejson, "w")
    fd.write(jsondata)
    fd.close()
  except MyError as e:
    print "Error with generate dataviz to Movielens"

def load_json(path):
  dataori = []
  with open(path) as data_file:
    dataori = json.load(data_file)
  return dataori

generate()
"""
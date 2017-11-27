import json
import simplejson
import csv
import numpy as np
from sklearn.manifold import TSNE
from sklearn.manifold import MDS
from sklearn.preprocessing import normalize 
from time import time

#este tsne es mas rapido supuestamente
from bhtsne import tsne


"""
main function for the projection
data = It is a matrix x dimensions no normalized
details = it is a array of detail with length = # dimensions
Example details array: 
[
        {"type": "string"       , "detail": []},
        {"type": "integer"      , "detail": [0, 5]},
        {"type": ""             , "detail": []}
]

with string i have no details
but with integer i have a tuple with min and max value
"""

class MyError(Exception):
  def __init__(self, value):
    self.value = value
  def __str__(self):
    return repr(self.value)

def myformat_dec(x):
  hh = ('%.5f' % x).rstrip('0').rstrip('.')
  return float(hh)

def projection(data, details):
        #string, int

    det_details = []

    for det in details:
        if det["type"] == "":
            det_details.append([100000, -1000000])
        elif det["type"] == "String":
            det_details.append(set())
        elif det["type"] == "Number":
            if det["detail"] == []:
                det_details.append([100000, -1000000])
            else:
                det_details.append(det["detail"])
    no = 0            
    for da in data:
        if no == 0:
            no = 1
        else:
            for i in xrange(0, len(details)):
                if details[i]["type"] == "":
                    det_details[i][0] = min(det_details[i][0], float(da[i+1]))
                    det_details[i][1] = max(det_details[i][1], float(da[i+1]))
                elif details[i]["type"] == "String":
                    det_details[i].add(da[i+1].lower())
                elif details[i]["type"] == "Number":
                    if details[i]["detail"] == []:
                        det_details[i][0] = min(det_details[i][0], float(da[i+1]))
                        det_details[i][1] = max(det_details[i][1], float(da[i+1]))
            #no = no + 1                
    #maping the details type = string => {"string": "idx"}
    for i in xrange(0, len(details)):
        aux = {}
        j = 0
        if details[i]["type"] == "String":
            for ss in det_details[i]:
                aux[ss] = j
                j = j + 1
            det_details[i] = aux
                
    print "*********"
    print det_details
    print "*********"

#Here begin the t-sne algorithm with python

    arr_tsne = []
    no = 0
    for da in data_dim:
        if no == 0:
            no = 1
        else:   
            aux = []
            for i in xrange(0, len(details)):
                jj = 0.0
                if details[i]["type"] == "String":
                    jj = myscale(0.0, len(det_details[i])-1, 0.0, 1.0, float(det_details[i][da[i+1].lower()]) )
                else:
                    if float(da[i+1]) < det_details[i][0]:
                        jj = -1
                    else:
                        jj = myscale(det_details[i][0], det_details[i][1], 0.0, 1.0, float(da[i+1]) ) 
                jj = myformat_dec(jj)
                aux.append(jj)
            arr_tsne.append(aux)    
    
    #arr_tsne = arr_tsne[1:6000]
    arr_tsne2 = np.array(arr_tsne)
    arr_tsne2 = arr_tsne2.tolist()
    print 'yyyyyyyyyyyyyyyyyyy'
    print data[0][1:]
    print len(arr_tsne2[0])
    print 'yyyyyyyyyyyyyyyyyyy'


    heatmap = {"headers": data[0][1:].tolist(), "body": arr_tsne2}

    print "mmmmmmmmmmmmmmmmm"
    print heatmap["headers"]
    print heatmap["body"][1:3]
    print len(heatmap["body"][0])
    print "mmmmmmmmmmmmmmmmm"

    """
    fifib = "../data/BookCrossing/heatmap.json"
    fifim = "../data/Movielens/heatmap.json"

    try:
      jsondata = simplejson.dumps(heatmap,sort_keys=True)
      namejson = fifim;
      fd = open(namejson, 'w')
      fd.write(jsondata)
      fd.close()
    except MyError as e:
      print 'ERROR writing', e.value
    """
    


def myscale(old_min, old_max, new_min, new_max, old_value):
    return ( (old_value - old_min) / (old_max - old_min) ) * (new_max - new_min) + new_min 


filem = "../data-noprocesed/Movielens/movielens-dimensions.csv"
fileb = "../data-noprocesed/Book-Crossing/BX-dimensions.csv"
data_dim = []

reader = csv.reader(open(filem, "rb"), delimiter = ",")
X = list(reader)
data_dim = np.array(X)
"""
{"type": "String", "detail": []}
{"type": "Number", "detail": []}
{"type": "Number", "detail": [0, 5]}
{"type": "" , "detail": []}"""

dettallesm = [
    {"type": "String", "detail": []},   {"type": "Number", "detail": []},       {"type": "Number", "detail": []},   {"type": "Number", "detail": []},
    {"type": "Number", "detail": []},   {"type": "Number", "detail": [1, 5]},   {"type": "Number", "detail": []},   {"type": "Number", "detail": [1, 5]},
    {"type": "Number", "detail": []},   {"type": "Number", "detail": [1, 5]},   {"type": "Number", "detail": []},   {"type": "Number", "detail": [1, 5]},
    {"type": "Number", "detail": []},   {"type": "Number", "detail": [1, 5]},   {"type": "Number", "detail": []},   {"type": "Number", "detail": [1, 5]},
    {"type": "Number", "detail": []},   {"type": "Number", "detail": [1, 5]},   {"type": "Number", "detail": []},   {"type": "Number", "detail": [1, 5]},
    {"type": "Number", "detail": []},   {"type": "Number", "detail": [1, 5]},   {"type": "Number", "detail": []},   {"type": "Number", "detail": [1, 5]},
    {"type": "Number", "detail": []},   {"type": "Number", "detail": [1, 5]},   {"type": "Number", "detail": []},   {"type": "Number", "detail": [1, 5]},
    {"type": "Number", "detail": []},   {"type": "Number", "detail": [1, 5]},   {"type": "Number", "detail": []},   {"type": "Number", "detail": [1, 5]},
    {"type": "Number", "detail": []},   {"type": "Number", "detail": [1, 5]},   {"type": "Number", "detail": []},   {"type": "Number", "detail": [1, 5]},
    {"type": "Number", "detail": []},   {"type": "Number", "detail": [1, 5]},   {"type": "Number", "detail": []},   {"type": "Number", "detail": [1, 5]}
]

dettallesb = [
    {"type": "Number", "detail": []}
]

projection(data_dim, dettallesm)

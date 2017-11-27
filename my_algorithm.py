import numpy as np

import my_cluster as mycluster
import my_knn as myknn

"""
data_selected   : It is the data selected in save area interface
dataset         : It is the total data
k_groups        : It is the number of groups we want
"""

def generate(dataset, data_selected, k_groups, dataFull, features):
  neighbors = get_array_K_neighbors(dataset, data_selected)
  
  print ("len neighbors", neighbors)

  dataFull2 = []
  dataFull2.append(dataFull[0])
  for nn in neighbors:
    dataFull2.append(dataFull[nn + 1])# more one because at the first line are the names

  newdataset = normalizing(dataFull2, features) 
  print ("holis newdataset", len(newdataset), len(newdataset[0]))

  centers, labels = mycluster.kmeans(newdataset, k_groups, len(newdataset[0])) 
  print ("labels", labels, len(labels))

  return fixing_data(neighbors, labels)

def fixing_data(data, labels):
  data = list(data)
  n_cluster = set(labels)
  
  clu = [[] for i in range(len(n_cluster))]

  for x in xrange(0, len(data)):
    clu[int(labels[x])].append(data[x])

  zeros = [0]*len(n_cluster)
  jjson = {"cluster": zeros, "content": []}
  for x in xrange(0, len(clu)):
    kk = {"id": x, "objects": clu[x]}
    jjson["content"].append(kk)
  return jjson

def normalizing(data, details):
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
              

  arr_tsne = []
  no = 0
  for da in data:
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
  
  print "mmmmmmmmmmmmmmmmm"
  print arr_tsne2[0]
  print "mmmmmmmmmmmmmmmmm"
  return arr_tsne2

    

def myscale(old_min, old_max, new_min, new_max, old_value):
    return ( (old_value - old_min) / (old_max - old_min) ) * (new_max - new_min) + new_min 

def myformat_dec(x):
  hh = ('%.5f' % x).rstrip('0').rstrip('.')
  return float(hh)

def get_array_K_neighbors(dataset, data_selected):
  res = set()    
  for i in xrange(0,len(data_selected)):
    data = myknn.my_knn(data_selected[i], dataset)
    res |= set(data)
  print ("do", res)
  return res


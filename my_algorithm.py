import numpy as np

import my_cluster as mycluster
import my_knn as myknn

"""
data_selected   : It is the data selected in save area interface
dataset         : It is the total data
k_groups        : It is the number of groups we want
"""

def generate(dataset, data_selected, k_groups, dataFull, features, dataViz):
  neighbors = get_array_K_neighbors(dataset, data_selected)
  
  
  dataFull2 = []
  headers = dataFull["headers"]
  indices = []
  #dataFull2.append(dataFull[0])
  for nn in neighbors:
    dataFull2.append(dataFull["body"][nn])
    indices.append(nn)

  newdataset = normalizing(dataFull2, features, dataViz, indices) 
  
  centers, labels = mycluster.kmeans(newdataset, k_groups, len(newdataset[0])) 
  
  return fixing_data(neighbors, labels, k_groups)

def fixing_data(data, labels, k_groups):
  data = list(data)
  
  clu = [[] for i in range(k_groups)]

  for x in xrange(0, len(data)):
    clu[int(labels[x])].append(data[x])

  zeros = [0]*k_groups
  jjson = {"cluster": zeros, "content": []}
  for x in xrange(0, len(clu)):
    kk = {"id": x, "objects": clu[x]}
    jjson["content"].append(kk)
  return jjson

def normalizing(data, details, dataViz, indices):
  det_details = []

  iii = 0 
  len_charts = len(details["Dimensions_charts"])

  for det in details["features"]:
    if iii < len_charts:
      det_details.append([0, len(details["Dimensions_charts"][iii]["titles"])-1])
    elif det["type"] == "String":
      det_details.append([-10000, 10000])
    else:
      if det["type"] == []:
        det_details.append([100000, -1000000])
      else:
        det_details.append(det["detail"])
    #iii += 1
  


  for da in data:
    for i in xrange(0, len(details["features"])):
      if i < len_charts:
        continue
      elif details["features"][i]["type"] == "String":
        continue
      else:
        if details["features"][i]["detail"] == []:
          det_details[i][0] = min(det_details[i][0], float(da[i+1]))#mas uno por que la primera posicion es el ID
          det_details[i][1] = max(det_details[i][1], float(da[i+1]))

  
  

  arr_tsne = []
  heat_tsne = []
  ii = 0
  for da in data:
    aux = []
    for i in  xrange(0, len(details["features"])):
      val = 0.0
      if i < len_charts:
        ind = dataViz["instances"][indices[ii]]["values"][i]
        val = myscale(det_details[i][0], det_details[i][1], 0.0, 1.0, float(ind))
      elif details["features"][i]["type"] == "String":
        ind = details["Dimensions_charts"][i]["titles"].index(da[i+1])
        val = myscale(det_details[i][0], det_details[i][1], 0.0, 1.0, float(ind))    
      else:
        val = myscale(float(det_details[i][0]), float(det_details[i][1]), 0.0, 1.0, float(da[i+1]))    
        if float(da[i+1]) < float(det_details[i][0]):
          val_heat = -1
        else:
          val_heat = val
      if val < 0 or val > 1:
        print ("new grupos errors", det_details[i], da[i+1], i)
      #print ("special", da, da[i+1])
      
      val = myformat_dec(val)
      aux.append(val)
    arr_tsne.append(aux)
    ii += 1        
  print ("det_details", det_details)
  #arr_tsne = arr_tsne[1:6000]
  arr_tsne2 = np.array(arr_tsne)
  arr_tsne2 = arr_tsne2.tolist()
  
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
  return res


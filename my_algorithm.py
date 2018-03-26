import numpy as np

import my_cluster as mycluster
import my_knn as myknn

import math
import random

#pTop es un array con las dimensiones top segun la eleccion del usuario
def generate_groups(dataset, data_selected, k_groups, pTop, simi):
  n_random = 1
  lis_knn = []
  for i in xrange(0,len(data_selected)):
    lis_knn.append(myknn.my_knn(data_selected[i], dataset, pTop, simi))
  print ("paso los lis_knn")
  
  newgroups = []
  for i in xrange(0, k_groups):
    newgroups.append([])

  for k in xrange(0, k_groups):
    for u in xrange(0, len(data_selected)):
      for r in xrange(0, n_random):
        flag = False
        cc = 0
        nrand = -1
        while not flag:
          nrand = random.randint(0, len(lis_knn[u])-1)
          cc = cc + 1
          if lis_knn[u][nrand] not in newgroups[k]:
            flag = True
          if cc > 100:
            break
        if flag:
          newgroups[k].append(lis_knn[u][nrand])
          del lis_knn[u][nrand]
        

  """for ite in xrange(0, len(data_selected)):
    for k in xrange(0, k_groups):
      for rr in xrange(0, n_random):
        nrand = random.randint(0, len(lis_knn[ite])-1)
        newgroups[k].append(lis_knn[ite][nrand])
        del lis_knn[ite][nrand]"""
        
  print ("paso la asignacion")
  res = {"cluster": [0]*k_groups, "content": []}    
  for i in xrange(0, k_groups):
    res["content"].append({"objects": newgroups[i], "id": i})

  return res



def print_data_selected(data, data_selected):
  print "**********data_selected*****start*****"
  for i in xrange(0, len(data_selected)):
    print data[data_selected[i]]
  print "**********data_selected*****end*****"


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
      if det["detail"] == []:
        det_details.append([100000, -1000000])
      else:
        det_details.append(det["detail"])
    iii += 1
  


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
      #if val < 0 or val > 1:
        #print ("new grupos errors", det_details[i], da[i+1], i)
      #print ("special", da, da[i+1])
      
      val = myformat_dec(val)
      aux.append(val)
    arr_tsne.append(aux)
    ii += 1        
  #print ("det_details", det_details)
  #arr_tsne = arr_tsne[1:6000]
  arr_tsne2 = np.array(arr_tsne)
  arr_tsne2 = arr_tsne2.tolist()
  
  return arr_tsne2

    

def myscale(old_min, old_max, new_min, new_max, old_value):
    return ( (old_value - old_min) / (old_max - old_min) ) * (new_max - new_min) + new_min 

def myformat_dec_2(x):
  hh = ('%.4f' % x).rstrip('0').rstrip('.')
  return float(hh)

def myformat_dec(x):
  hh = ('%.5f' % x).rstrip('0').rstrip('.')
  return float(hh)

#este extrae una lista de vecinos mas proximos por cada usuario
def get_array_list_K_neighbors(dataset, data_selected):
  res = []
  for i in xrange(0,len(data_selected)):
    res.apppend(myknn.my_knn(data_selected[i], dataset))
  return res

#extrae un solo arreglo con los usuarios similares
def get_array_K_neighbors(dataset, data_selected):
  res = set()    
  for i in xrange(0,len(data_selected)):
    data = myknn.my_knn(data_selected[i], dataset)
    print "dataKNN--------------------------"
    print data
    print "dataKNN--------------------------"
    res |= set(data)
  return res

#This is the KL-divergence
def process_similarity(data_heatmap, newGroups, data_ori):
  
  n_dimen = len(data_heatmap[0])
  
  pre = {"cluster": [], "content": [], "histo_ori": []}
  indice = 0;
  for ii in xrange(0, len(newGroups["content"])):
    if len(newGroups["content"][ii]["objects"]) > 0:
      newGroups["content"][ii]["id"] = indice
      pre["content"].append(newGroups["content"][ii])
      pre["cluster"].append(0)
      indice += 1

  newGroups = pre
  sumtotal = 0.0
  ori = np.zeros(n_dimen)
  for do in data_ori:
    for i in xrange(0, n_dimen):
      fab = float(data_heatmap[do][i])
      if fab < 0.0:
        fab = 0.0
      if fab > 1.0:
        fab  = 1.0
      ori[i] += fab
      sumtotal += fab
    pass

  ori = ori / float(sumtotal)

  newGroups["histo_ori"] = ori.tolist()

  histograms = []
  for ng in newGroups["content"]:
    aux = np.zeros(n_dimen)
    sumtotal = 0.0
    for cc in ng["objects"]:
      for i in xrange(0, n_dimen):
        fab = float(data_heatmap[cc][i])
        if fab < 0.0:
          fab = 0.0
        if fab > 1.0:
          fab  = 1.0
        aux[i] += fab
        sumtotal += fab
      pass
    pass
    aux = aux / float(sumtotal)
    histograms.append(aux)
  pass

  res_kl = []
  holis = 0 
  for hi in histograms:
    #simi = kl_divergence(ori, hi)
    simi = bhattacharyya(ori, hi)
    res_kl.append(simi)
    newGroups["content"][holis]["histo"] = hi.tolist()
    holis += 1
  for rr in xrange(0, len(res_kl)):
    newGroups["content"][rr]["similarity"] = res_kl[rr]

  #print ("carambaaaa", newGroups)
  return newGroups


def bhattacharyya(h1, h2):
  return np.sum(np.sqrt(np.multiply(h1, h2)))

def kl_divergence(histo_1, histo_2):
  """
  P = []
  Q = []
  print ("histos", histo_1, histo_2)

  for i in xrange(0, len(histo_1)):
    pp = float(histo_1[i])
    qq = float(histo_2[i])
    if pp != 0.0 and qq != 0:
      P.append(pp)
      Q.append(qq)

  P = np.array(P)
  Q = np.array(Q)

  sumP = P.sum()
  sumQ = Q.sum()

  print ("alma", P, Q, sumP, sumQ)


  P = P * (1 / sumP)
  Q = Q * (1 / sumQ)

  

  n = len(P)
  #eps = np.finfo(float).eps
  res = 0
  res = (P * np.log10(P/Q)).sum()

  res = myformat_dec_2(1 - res)
  """
  #a = np.asarray(histo_1, dtype=np.float)
  #b = np.asarray(histo_2, dtype=np.float)

  #res =  np.sum(np.where(a != 0, a * np.log(a / b), 0))
  print ""
  print "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  print histo_1
  print "-----------------------------"
  print histo_2
  print "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  res1 = euclideanDis(histo_1, histo_2)
  res1 = myscale2(0, math.sqrt(18), 0, 1, res1)
  res = res1
  res = myformat_dec_2(1.0 - res)

  print ("TTTTTTTttttt", res)
  if math.isnan(res):
    res = 0.12345
  elif res < 0.0:
    res = 0.01
  elif res > 1.0:
    res = 0.9998

  return res


def euclideanDis(point1, point2):
  squareSums = 0
  n_dims = len(point2)
  for i in xrange(0, n_dims):
    a = point1[i]
    b = point2[i]
    if a == -1:
      a = 0
    if b == -1:
      b = 0
    diff = a - b
    squareSums += (diff * diff)
  d = squareSums ** 0.5
  return d
  #similarity = d
  #similarity = 1 / (1 + d)
  #return similarity

def myscale2(old_min, old_max, new_min, new_max, old_value):
  return ( (old_value - old_min) / (old_max - old_min) ) * (new_max - new_min) + new_min 
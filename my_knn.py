import numpy as np


#example - delete
g = [[1,2,3,4,5,6,7], [2,3,4,5,3,2,6], [9,7,5,3,7,5,2], [5,9,1,4,8,2,6], [1,2,3,4,5,6,7], [7,6,5,4,3,2,1], [100, 100, 100, 100, 100, 100, 100]]
res = []
aux_arr = []

def my_knn(idx, data, pTop, simi, K = 50):
  #format of data is a matriz normalized: objects_1 by dimensions 
  global aux_arr
  global res
  aux_arr = range(len(data))
  res = findK_NN(idx, data, pTop, simi)

  res2 = sorted(res)
  #print ("mas cercano", res[0])
  #print ("mas lejano", res[-2])
  """if simi == 0:
    vec = sorted(aux_arr, cmp = myFn)
  else:
    vec = sorted(aux_arr, cmp = myFn_Desimilarity)"""
  #print ("que quieres de mi 1: ", aux_arr)
  vec = sorted(aux_arr, cmp = myFn)
  #print ("que quieres de mi 2: ", vec)
  #distanciamaxima(data)
  #print "halle los k mejores"
  if simi == 0:
    return vec[0:K]
  return vec[len(vec)-K-1:len(vec)-1]


def distanciamaxima(data):
  
  res = -1000.0
  for i in xrange(0, len(data)):
    for j in xrange(0, len(data)):
      res = max(res, euclideanSimilarity(data[i], data[j], [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]))
  print ("maximo:", res)
  

def findK_NN(idx, data, pTop, simi):
  
  similarity = []
  for i in xrange(0, len(data)):
    if idx != i:
      sim = euclideanSimilarity2(data[idx], data[i], pTop)
      similarity.append(sim)
    else:
      if simi == 0:
        similarity.append(-1)
      else:
        similarity.append(2)
  return similarity  


def euclideanSimilarity2(point1, point2, pTop):
  for i in xrange(0, len(point1)):
    if point1[i] == -1:
      point1[i] = 0;
    if point2[i] == -1:
      point2[i] = 0;
  return bhattacharyya(point1, point2)


def euclideanSimilarity(point1,  point2, pTop):
  squareSums = 0
  n_dims = len(pTop)
  for i in xrange(0, n_dims):
    a = point1[pTop[i]]
    b = point2[pTop[i]]
    if a == -1:
      a = 0
    if b == -1:
      b = 0
    diff = a - b
    squareSums += (diff * diff)
  d = squareSums ** 0.5
  #radius = 0.4
  similarity = 0
  #if d < radius:
  similarity = 1 / (1 + d)
  return similarity

def myFn(a, b):
  aa = int(res[a] * 1000000000)
  bb = int(res[b] * 1000000000)
  return bb - aa

def myFn_Desimilarity(a, b):
  aa = int(res[a] * 1000000000)
  bb = int(res[b] * 1000000000)
  return aa - bb
  

def bhattacharyya(h1, h2):
  return np.sum(np.sqrt(np.multiply(h1, h2)))
"""
#example
res2 = my_knn(0, g)
print ("wtf", res2)
"""
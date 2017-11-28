import numpy as np


#example - delete
g = [[1,2,3,4,5,6,7], [2,3,4,5,3,2,6], [9,7,5,3,7,5,2], [5,9,1,4,8,2,6], [1,2,3,4,5,6,7], [7,6,5,4,3,2,1], [100, 100, 100, 100, 100, 100, 100]]
res = []
aux_arr = []

def my_knn(idx, data, K = 100):
  #format of data is a matriz normalized: objects_1 by dimensions 
  global aux_arr
  global res
  aux_arr = range(len(data))
  res = findK_NN(idx, data)
  vec = sorted(aux_arr, cmp = myFn)

  return vec[0:K]



def findK_NN(idx, data):

  similarity = []
  for i in xrange(0, len(data)):
    if idx != i:
      sim = euclideanSimilarity(data[idx], data[i])
      similarity.append(sim)
    else:
      similarity.append(-1)
  return similarity  

def euclideanSimilarity(point1,  point2):
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
  similarity = 1 / (1 + d)
  return similarity

def myFn(a, b):
  aa = int(res[a] * 10000)
  bb = int(res[b] * 10000)
  return aa - bb
  
"""
#example
res2 = my_knn(0, g)
print ("wtf", res2)
"""
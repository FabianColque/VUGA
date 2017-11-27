import numpy as np
# K - Means

LIMITS = 2
MAX_ITERATIONS = 100

def kmeans(dataset, k, number_features):
  dataset = np.array(dataset)
  numFeatures = number_features
  centroids = getRandomCentroids(numFeatures, k)

  iterations = 0
  oldCentroids = None
  labels = None
  
  while not shouldStop(oldCentroids, centroids, iterations):
    oldCentroids = centroids
    iterations += 1

    labels = getLabels(dataset, centroids)

    centroids = getCentroids(dataset, labels, k, numFeatures)

  return centroids, labels


def getCentroids(dataset, labels, k, numFeatures):
  
  centros = np.zeros((k, numFeatures))
  counts = np.zeros(k)

  #print ("mierda", centros)

  i = 0
  for da in dataset:
    #print ("life", da)
    #print ("ends", labels[i])
    #print ("ra", centros[int(labels[i])])
    centros[int(labels[i])] += da
    counts[int(labels[i])] += 1
    i += 1
  i = 0
  for ce in centros:
    if(counts[i] > 0):
      ce /= counts[i]
    else:
      ce = np.random.rand(k) * LIMITS
    i += 1
  return centros


def getLabels(dataset, centroids):
  labels = np.zeros(len(dataset))
  i = 0
  for da in dataset:
    min_dis = 1000000.0
    j = 0
    c = -1
    for cen in centroids:
      dis = np.sqrt(sum((da - cen) ** 2))
      if dis <= min_dis:
        min_dis = dis
        c = j
      j += 1
    labels[i] = c
    i += 1
  return labels

def shouldStop(oldCentroids, centroids, iterations):
  if iterations > MAX_ITERATIONS:
    print "maximum of iterations" 
    return True
  return np.array_equal(oldCentroids, centroids)


def getRandomCentroids(numFeatures, k):
  #my limits are [-10, 10]    
  return np.random.rand(k, numFeatures) * LIMITS


#example
"""
data = np.random.rand(6000, 40) * LIMITS
k = 5
cent, labs = kmeans(data, k, 40) 

print ("olha", labs)
"""

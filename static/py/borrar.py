from bhtsne import tsne
from sklearn.datasets import load_iris
from matplotlib import pyplot as plt

iris = load_iris()
print '****************************'
print iris.data
print '****************************'
Y = tsne(iris.data)
print '+++++++++++++++++++++++++++++++++++'
print Y
print '+++++++++++++++++++++++++++++++++++'
plt.scatter(Y[:, 0], Y[:, 1], c=iris.target)
plt.show()
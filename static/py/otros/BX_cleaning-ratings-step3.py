import csv
import json
import simplejson

"""
Elimino a las filas donde los ISBN no existen en el archivo de book file

"""


data_book = []
data_ratings = []

datares = [];
    
class MyError(Exception):
  def __init__(self, value):
    self.value = value
  def __str__(self):
    return repr(self.value)

def main():
  for ra in data_ratings:
    if binary_search_bookID(ra["ISBN"]) != -1:
      datares.append(ra)

  fields = ["User-ID", "ISBN", "Book-Rating"]
        
  with open("../data-noprocesed/Book-Crossing/BX-Book-Ratings-clean-step3.csv", "w") as csvfile:
    fieldnames = fields
    writer = csv.DictWriter(csvfile, fieldnames = fieldnames)

    writer.writeheader()
    for dr in datares:
      writer.writerow(dr)    


def load_book(file):
  global data_book
  with open(file) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
      aux = {}
      aux["ISBN"]                   = str(row["ISBN"])
      data_book.append(aux)
  data_book = sorted(data_book)
  print "book elem 0"
  print data_book[0]
  print data_book[len(data_book)-1]
  print "book elem 0"

def load_Ratings(file):
  global data_ratings
  with open(file) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
      aux = {}
      aux["User-ID"]          = row["User-ID"]
      aux["ISBN"]             = str(row["ISBN"])
      aux["Book-Rating"]      = row["Book-Rating"]
      data_ratings.append(aux)  


def binary_search_bookID(target):
  lower = 0
  upper = len(data_book) - 1
  found = False
  res = []
  #g = 0
  while lower <= upper and not found:   # use < instead of <=
    midpoint = (lower + upper) // 2
    val = data_book[midpoint]["ISBN"] #array[x]
    
    if val == target:
      found = True
      res = midpoint
    else:
      if target < val:
        upper = midpoint -1
      else:
        lower = midpoint + 1    

  if found == True:
      return res    
  return -1  


load_book("../data-noprocesed/Book-Crossing/BX-Books-step3.csv")
load_Ratings("../data-noprocesed/Book-Crossing/BX-Book-Ratings-clean-step2.csv")
main()
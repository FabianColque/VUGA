import csv
import json
import simplejson

"""
Elimino a las filas donde los isbn no existen en el rating file

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
  for ra in data_book:
    if binary_search_bookID(ra["ISBN"]) != -1:
      datares.append(ra)

  fields = ["ISBN","Book-Title","Book-Author","Year-Of-Publication","Publisher"]
        
  with open("../data-noprocesed/Book-Crossing/BX-Books-step3.csv", "w") as csvfile:
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
      aux["Book-Title"]             = row["Book-Title"]
      aux["Book-Author"]            = row["Book-Author"]
      aux["Year-Of-Publication"]    = row["Year-Of-Publication"]
      aux["Publisher"]              = row["Publisher"]
      data_book.append(aux)
  

def load_Ratings(file):
  global data_ratings
  with open(file) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
      aux = {}
      aux["ISBN"]             = str(row["ISBN"])
      data_ratings.append(aux)  
  data_ratings = sorted(data_ratings)
  print "book elem 0"
  print data_ratings[0]
  print data_ratings[len(data_ratings)-1]
  print "book elem 0"

def binary_search_bookID(target):
  lower = 0
  upper = len(data_ratings) - 1
  found = False
  res = []
  #g = 0
  while lower <= upper and not found:   # use < instead of <=
    midpoint = (lower + upper) // 2
    val = data_ratings[midpoint]["ISBN"] #array[x]
    
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


load_book("../data-noprocesed/Book-Crossing/BX-Books-step2.csv")
load_Ratings("../data-noprocesed/Book-Crossing/BX-Book-Ratings-clean-step3.csv")
main()
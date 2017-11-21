import csv
import json
import simplejson

"""
Elimino a las filas donde los id users no existen en el rating file

"""

data_user = []
data_ratings = []

datares = [];
    
class MyError(Exception):
  def __init__(self, value):
    self.value = value
  def __str__(self):
    return repr(self.value)

def main():
  for ra in data_user:
    if binary_search_bookID(ra["User-ID"]) != -1:
      datares.append(ra)

  fields = ["User-ID","User-name","Location","Age"]
        
  with open("../data-noprocesed/Book-Crossing/BX-Users-step1.csv", "w") as csvfile:
    fieldnames = fields
    writer = csv.DictWriter(csvfile, fieldnames = fieldnames)

    writer.writeheader()
    for dr in datares:
      writer.writerow(dr)    


def load_user(file):
  global data_user
  with open(file) as csvfile: 
    reader = csv.DictReader(csvfile)
    for row in reader:
      aux = {}
      aux["User-ID"]                   = str(row["User-ID"])
      aux["User-name"]             = row["User-name"]
      aux["Location"]            = row["Location"]
      aux["Age"]                  = row["Age"]
      data_user.append(aux)
  

def load_Ratings(file):
  global data_ratings
  with open(file) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
      aux = {}
      aux["User-ID"]             = str(row["User-ID"])
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
    val = data_ratings[midpoint]["User-ID"] #array[x]
    
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


load_user("../data-noprocesed/Book-Crossing/BX-Users.csv")
load_Ratings("../data-noprocesed/Book-Crossing/BX-Book-Ratings.csv")
main()
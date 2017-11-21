import csv
import json
import simplejson


"""
Eliminar las filas de rating file donde los usuarios de rating file no fueron encontrados en user file 

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
  for ra in data_ratings:
    if binary_search_userID(ra["User-ID"]) != -1:
      datares.append(ra)

  fields = ["User-ID", "ISBN", "Book-Rating"]
        
  with open("../data-noprocesed/Book-Crossing/BX-Book-Ratings-clean-step1.csv", "w") as csvfile:
    fieldnames = fields
    writer = csv.DictWriter(csvfile, fieldnames = fieldnames)

    writer.writeheader()
    for dr in datares:
      writer.writerow(dr)    

def existe_users(user):
  for u in data_user:
    if u["User-ID"] == user:
      return True
  return False

def load_users(file):
  global data_user
  with open(file) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
      aux = {}
      aux["User-ID"]        = str(row["User-ID"])
      data_user.append(aux)

def load_Ratings(file):
  global data_ratings
  with open(file) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
      aux = {}
      aux["User-ID"]          = str(row["User-ID"])
      aux["ISBN"]             = row["ISBN"]
      aux["Book-Rating"]      = row["Book-Rating"]
      data_ratings.append(aux)  



def binary_search_userID(target):
  lower = 0
  upper = len(data_user) - 1
  found = False
  res = []
  #g = 0
  while lower <= upper and not found:   # use < instead of <=
    midpoint = (lower + upper) // 2
    val = data_user[midpoint]["User-ID"] #array[x]
    
    if val == target:
      found = True
      res = midpoint
    else:
      if int(target) < int(val):
        upper = midpoint -1
      else:
        lower = midpoint + 1    

  if found == True:
      return res    
  return -1  

load_users("../data-noprocesed/Book-Crossing/BX-Users-wo-nulls.csv")
load_Ratings("../data-noprocesed/Book-Crossing/BX-Book-Ratings.csv")
main()
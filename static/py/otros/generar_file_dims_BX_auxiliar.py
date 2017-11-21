import csv
import json
import simplejson

##Format 
#

data_book = []
data_ratings = []
data_user = []

datares = [];

ggenres = ["Action", "Adventure", "Animation", "Children's", "Comedy", "Crime", "Documentary", "Drama", "Fantasy", "Film-Noir", "Horror", "Musical", "Mystery", "Romance", "Sci-Fi", "Thriller", "War", "Western"]
    
class MyError(Exception):
  def __init__(self, value):
    self.value = value
  def __str__(self):
    return repr(self.value)

#for ra in data_ratings
def main():
  global datares
  prenum_rev = "#Rev"
  prenum_rat = "avgRat"

  for au in data_user:
    aux = {}
    aux["ID"] = au["User-ID"]  
    aux["Age"]    = au["Age"]
    datares.append(aux)  


  fields = ["ID", "Age"]
        
  with open("../data-noprocesed/Book-Crossing/BX-dimensions.csv", "w") as csvfile:
    fieldnames = fields
    writer = csv.DictWriter(csvfile, fieldnames = fieldnames)

    writer.writeheader()
    for dr in datares:
      writer.writerow(dr)



def load_users(file):
  global data_user
  with open(file) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
      aux = {}
      aux["User-ID"]      = int(row["User-ID"])
      aux["Age"]          = int(row["Age"])
      data_user.append(aux)

def load_Ratings(file):
  global data_ratings
  with open(file) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
      aux = {}
      aux["User-ID"]          = int(row["User-ID"])
      aux["ISBN"]             = int(row["ISBN"])
      aux["Book-Rating"]      = int(row["Book-Rating"])
      data_ratings.append(aux)  

def load_book(file):
  global data_book
  with open(file) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
      aux = {}
      aux["ISBN"]                   = int(row["ISBN"])
      aux["Year-Of-Publication"]    = int(row["Year-Of-Publication"])
      data_book.append(aux)

def processGenre(str):
  gg = ["Action", "Adventure", "Animation", "Children's", "Comedy", "Crime", "Documentary", "Drama", "Fantasy", "Film-Noir", "Horror", "Musical", "Mystery", "Romance", "Sci-Fi", "Thriller", "War", "Western"]
  basic = {}
  for g in gg:
    basic[g] = 0
  arr = str.split("|")
  for ar in arr:
    basic[ar] = basic[ar] + 1
  return arr      

def binary_search_movieID(target):
  lower = 0
  upper = len(data_book)
  while lower < upper:   # use < instead of <=
    x = lower + (upper - lower) // 2
    val = data_book[x]["MovieID"] #array[x]
    if target == val:
      return x
    elif target > val:
      if lower == x:   # this two are the actual lines
          break        # you're looking for
      lower = x
    elif target < val:
      upper = x    
  return -1        

load_users("../data-noprocesed/Book-Crossing/BX-Users.csv")
#load_book("../data-noprocesed/Book-Crossing/BX-Books.csv")
#load_Ratings("../data-noprocesed/Book-Crossing/BX-Book-Ratings.csv")
main()
import csv
import json
import simplejson

##Format 
#

data_movie = []
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
    aux["ID"] = au["UserID"]  
    aux["Gender"] = au["Gender"]
    aux["Age"]    = au["Age"]
    aux["Ocupation"] = au["Occupation"]
    aux["#totalReviews"] = 0 
    for gg in ggenres:
      aux[prenum_rev + gg] = 0
      aux[prenum_rat + gg] = 0
    datares.append(aux)  

  for ra in data_ratings:
    iduser = ra["UserID"]
    rating = ra["Rating"]
    idmovie = binary_search_movieID(ra["MovieID"])
    #aqui empezar a modificar, aqui es total reviews
    datares[iduser-1]["#totalReviews"] = datares[iduser-1]["#totalReviews"] + 1
    ####
    if idmovie != -1:   
      genres = data_movie[idmovie]["Genres"]
      for v in genres:
        #datares[iduser-1]["#totalReviews"] = datares[iduser-1]["#totalReviews"] + 1
        datares[iduser-1][prenum_rev + v] = datares[iduser-1][prenum_rev + v] + 1
        datares[iduser-1][prenum_rat + v] = datares[iduser-1][prenum_rat + v] + rating

  for rr in datares:
    for hh in ggenres:
      if rr[prenum_rev + hh] != 0:
        #rr[prenum_rat + hh] = int(round(float(rr[prenum_rat + hh])/rr[prenum_rev + hh]))
        rr[prenum_rat + hh] = float(rr[prenum_rat + hh])/rr[prenum_rev + hh]
      #else:
        #print rr               

  fields = ["ID", "Gender", "Age", "Ocupation", "#totalReviews"]
  for gg in ggenres:
    fields.append(prenum_rev + gg)
    fields.append(prenum_rat + gg)
        
  with open("../data-noprocesed/movielens-dimensions.csv", "w") as csvfile:
    fieldnames = fields
    writer = csv.DictWriter(csvfile, fieldnames = fieldnames)

    writer.writeheader()
    for dr in datares:
      writer.writerow(dr)


  ##print datares
  """try:
    jsondata  = simplejson.dumps(datares)
    namejson = "../../data/movielens/movielensV2.json"
    fd = open(namejson, "w")
    fd.write(jsondata)
    fd.close()
  except MyError as e:
    print "Error with normalizatio of data movielensV2"
  """

def load_users(file):
  global data_user
  with open(file) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
      aux = {}
      aux["UserID"]     = int(row["UserID"])
      aux["Gender"]     = row["Gender"]
      aux["Age"]        = int(row["Age"])
      aux["Occupation"] = int(row["Ocupation"])
      aux["Zip-code"]   = row["Zip-code"]
      data_user.append(aux)

def load_Ratings(file):
  global data_ratings
  with open(file) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
      aux = {}
      aux["UserID"]   = int(row["UserID"])
      aux["MovieID"]  = int(row["MovieID"])
      aux["Rating"]   = int(row["Rating"])
      aux["Timestamp"]= int(row["Timestamp"])
      data_ratings.append(aux)  

def load_movies(file):
  global data_movie
  with open(file) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
      aux = {}
      aux["MovieID"]  = int(row["MovieID"])
      aux["Title"]    = row["Title"]
      aux["Genres"]    = processGenre(row["Genres"])
      data_movie.append(aux)

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
  upper = len(data_movie)
  while lower < upper:   # use < instead of <=
    x = lower + (upper - lower) // 2
    val = data_movie[x]["MovieID"] #array[x]
    if target == val:
      return x
    elif target > val:
      if lower == x:   # this two are the actual lines
          break        # you're looking for
      lower = x
    elif target < val:
      upper = x    
  return -1        

load_users("../data-noprocesed/movielens-user.csv")
load_movies("../data-noprocesed/movielens-movie.csv")
load_Ratings("../data-noprocesed/movielens-ratings.csv")
main()
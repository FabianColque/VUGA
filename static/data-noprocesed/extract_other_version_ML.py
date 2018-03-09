import csv
import json
import simplejson


def start():
  #favorites_dimensions = ["ID","n_RevAction","n_RevAdventure","n_RevAnimation","n_RevChildrens","n_RevComedy","n_RevCrime","n_RevDocumentary","n_RevDrama","n_RevFantasy","n_RevFilm-Noir","n_RevHorror","n_RevMusical","n_RevMystery","n_RevRomance","n_RevSci-Fi","n_RevThriller","n_RevWar","n_RevWestern"]
  favorites_dimensions = ["ID", "n_RevDrama", "n_RevComedy", "n_RevAction", "n_RevThriller", "n_RevSci-Fi", "n_RevRomance", "n_RevAdventure", "n_RevCrime", "n_RevWar", "n_RevHorror", "n_RevChildrens", "n_RevAnimation", "n_RevMystery", "n_RevMusical", "n_RevFantasy", "n_RevFilm-Noir", "n_RevWestern", "n_RevDocumentary"]
  new_order_dimensions = ["ID", "Drama", "Comedy", "Action", "Thriller", "Sci-Fi", "Romance", "Adventure", "Crime", "War", "Horror", "Children", "Animation", "Mystery", "Musical", "Fantasy", "Film-Noir", "Western", "Documentary"]
  movielens_dimensions = load_csv_movielens_dimensions("Movielens/movielens-dimensions.csv", favorites_dimensions, new_order_dimensions)
  save_csv_movielens("MovielensNewDimensions/movielens-dimensions.csv", movielens_dimensions, new_order_dimensions)
  
  favorites_attributes_users = ["UserID","User-name","Gender","Age","Ocupation"]
  limites_totalReviews = [50,100,150,200,250,300,350,400,450,500]
  movilens_users = load_csv_movielens_users("Movielens/movielens-user.csv", favorites_attributes_users)
  favorites_attributes_users.append("n_totalReviews")
  movielens_dimensions2 = load_csv("Movielens/movielens-dimensions.csv")
  movilens_users = process_users(movilens_users, limites_totalReviews, movielens_dimensions2)
  save_csv_movielens("MovielensNewDimensions/movielens-user.csv", movilens_users, favorites_attributes_users)

def process_users(movilens_users, limites_totalReviews, dimensions_data):
  #solo quiero sacar el valor de n_totalReviews
  #print ("gsfa", dimensions_data[0]["n_totalReviews"])
  for i in xrange(0, len(movilens_users)):
    aux = int(dimensions_data[i]["n_totalReviews"])
    val = 50
    for j in xrange(0, len(limites_totalReviews)-1):
      if j == 0:
        if aux < limites_totalReviews[j]:
          val = 1
          break
      if j == len(limites_totalReviews)-2:
        if aux > limites_totalReviews[j+1]:
          val = limites_totalReviews[j+1]
          break
      if aux >= limites_totalReviews[j] and aux < limites_totalReviews[j+1]:
        val = limites_totalReviews[j]
        break
    movilens_users[i]["n_totalReviews"] = val
  return movilens_users


def load_csv_movielens_users(path, favorites):
  data = []
  with open(path) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
      aux = {}
      for fav in favorites:
        aux[fav] = row[fav]
      data.append(aux)
  return data


def load_csv_movielens_dimensions(path, favorites, new_order):
  data = []
  with open(path) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
      aux = {}
      for fav in xrange(0, len(favorites)):
        aux[new_order[fav]] = row[favorites[fav]]
      data.append(aux)
  return data

def load_csv(path):
  data = []
  with open(path) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
      data.append(row)
  return data

def save_csv_movielens(path, data, headers):
  with open(path, "w") as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames = headers)
    writer.writeheader()
    for dr in data:
      writer.writerow(dr)



#execute the functions
start()
import json
import csv
import operator

class MyError(Exception):
  def __init__(self, value):
    self.value = value
  def __str__(self):
    return repr(self.value)

#Todo el Fixing de BX sera usando los archivos ya arreglados por Fabian que estan
#ubicados en el Foler static/data-noprocesed/Book-Crossing, eso
#quiere decir que no son los archivos originales descargados de la web



#Working in the new BX-Users.csv
#Changing the Location with only the country
#The new Location could be: (someCountry | other)

dataUser = []
dataUserSet = {}
dataCountry = []

dataBookSet = {}

dataUser_content = {}
dataBook_content = {}

n_top = 10
limit_byCountry = 1500#Here we have the limit of 1500 by country

def start_mod():
  global dataUser
  dataUser = load_csv("../../data-noprocesed/Book-Crossing/BX-Users.csv")
  load_countries()
  paises = {}
  #Putting only the country in the dataUser      
  dataUser, paises = modifying_data_by_country(dataUser)
  #getting the top countries with more users
  paises = get_top(paises)
  #reducting the data with only the top contries
  dataUser = get_users_top_country(dataUser, paises)
  #limiting the data User
  dataUser = get_users_until_limit(dataUser, paises)
  #Saving the csv file to dataUser
  save_csv("BX-Users-country.csv", dataUser, ["User-ID", "User-name", "Location", "Age"])

  #modiying the ratings file
  dataRating = load_csv("../../data-noprocesed/Book-Crossing/BX-Book-Ratings.csv")
  dataRating = modify_rating_since_user(dataRating)
  save_csv("BX-Book-Ratings-new.csv", dataRating, ["User-ID","ISBN","Book-Rating"])

  #Modifiying the data Book file
  dataBooks = load_csv("../../data-noprocesed/Book-Crossing/BX-Books.csv")
  dataBooks = modiying_books_since_rating(dataBooks)
  save_csv("BX-Books-new.csv", dataBooks, ["ISBN","Book-Title","Book-Author","Year-Of-Publication","Publisher"])

  #Genering the dimension data file
  dataDimensions = generateDimensions()
  save_csv("BX-dimensions-new.csv", dataDimensions, ["ID", "Age", "Location", "Seniority-Book"])

  print ("len Dimensions", len(dataDimensions))
  print ("len Books", len(dataBooks))
  print ("len rating", len(dataRating))
  print ("len data", len(dataUser))

def generateDimensions():
  res = []
  for us in dataUser:
    aux = {"ID": us["User-ID"], "Age": us["Age"], "Location": us["Location"], "Seniority-Book": 0}
    count_year = 0
    for ye in dataUser_content[us["User-ID"]]:
      count_year += int(dataBook_content[ye]["Year-Of-Publication"])
    aux["Seniority-Book"] = count_year/len(dataUser_content[us["User-ID"]])
    res.append(aux)
  return res

def modiying_books_since_rating(books):
  global dataBook_content
  res = []
  for bo in books:
    if existBook_inRating(bo["ISBN"]) == True:
      res.append(bo)
      dataBook_content[bo["ISBN"]] = bo
  return res

def existBook_inRating(book):
  if book in dataBookSet:
    return True
  return False

def modify_rating_since_user(ratings):
  global dataBookSet
  global dataUser_content
  res = []
  ii = 0
  for ra in ratings:
    if existRating_inUsers(ra["User-ID"]) == True:
      res.append(ra)
      if not ra["ISBN"] in dataUser_content:
        dataUser_content[ra["User-ID"]] = [ra["ISBN"]]
      else:
        dataUser_content[ra["User-ID"]].append(ra["ISBN"])
      dataBookSet[ra["ISBN"]] = 1
    ii += 1
  
  return res

def existRating_inUsers(user):
  if user in dataUserSet:
    return True
  return False

def get_users_until_limit(data, top):
  global dataUserSet
  limits = {}
  res = []
  for tt in top:
    limits[tt] = 0
  ii = 0
  for da in data:
    if limits[da["Location"]] <= limit_byCountry:
      res.append(da)
      limits[da["Location"]] = limits[da["Location"]] + 1
      dataUserSet[da["User-ID"]] = 1
      
  return res

def get_users_top_country(data, top):
  res = []
  for da in data:
    if isIn_Top(da["Location"], top) == True:
      res.append(da)
  return res

def isIn_Top(loca, top):
  for tt in top:
    if loca == tt:
      return True
  return False

def modifying_data_by_country(data):
  paises = {}
  cont = 0
  for da in data:
    da["Location"] = getCountry(da["Location"])  
    if da["Location"] == "other":
      cont += 1
    else:
      if da["Location"] in paises:
        paises[da["Location"]] = paises[da["Location"]] + 1
      else:
        paises[da["Location"]] = 1
  return (data, paises)

def get_top(data):
  res = []
  data = sorted(data.items(), key=operator.itemgetter(1))
  for d in data:
    res.append(d[0])
  return res[len(res) - n_top:]

def load_csv(file):
  data = []
  with open(file) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
      data.append(row)
  return data

def save_csv(path, data, fields):
  #fields = ["User-ID", "User-name", "Location", "Age"]        
  with open(path, "w") as csvfile:
    fieldnames = fields
    writer = csv.DictWriter(csvfile, fieldnames = fieldnames)
    writer.writeheader()
    for dr in data:
      writer.writerow(dr)

def load_countries():
  global dataCountry
  co = load_csv("../../dataBrute/countries.csv")
  for c in co:
    dataCountry.append(c["country"].lower())

def getCountry(mystr):
  pos = mystr.rfind("-")
  res = mystr[pos+1:]
  res2 = getMatch(res.lower())
  return res2

def getMatch(mystr):
  for co in dataCountry:
    if co == mystr:
      return co
  return "other"

start_mod()

#este script permite imprimir un holis.txt, y este archivo tiene
#Las siguientes posibles salidas
#1 => usa
#2 => Fabian | loquesea
#lo que sea debe ser buscado en BX-User.csv y si pertenece a algun pais debe
#ser corregido manualmente
#Execution = python FixingALL_BX.py > holis.txt
"""
def getCountry(mystr):
  pos = mystr.rfind("-")
  res = mystr[pos+1:]
  if res == "":
    return "other"
  return res  

def load_csv(file):
  data = []
  with open(file) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
      data.append(row)
  return data  

data = load_csv("../../data-noprocesed/Book-Crossing/BX-Users.csv")
pre_countries = load_csv("../../dataBrute/countries.csv")

countries = []
for pre in pre_countries:
  countries.append(pre["country"])

def findOcurrence(country):
  for co in countries:
    if country == co.lower():
      return True
  return False

myset = set()
for da in data:
  kk = getCountry(da["Location"])
  myset.add(kk.lower())

print "set size", len(myset)

result = []
for hh in myset:
  hh = hh.lower()
  if findOcurrence(hh) == True:
    result.append(hh)
  else:
    result.append("Fabian | " + hh)

for re in result:
  print re

"""
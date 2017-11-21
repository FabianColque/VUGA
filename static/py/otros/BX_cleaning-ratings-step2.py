import csv
import json
import simplejson


"""
Ejecuto esto despues, aunque es para bx book, osea no debe seguir necesariamente el orden de step en rating
Aqui quito los ceros demas que tiene el bx-book file


data_book = []


datares = [];
    
class MyError(Exception):
  def __init__(self, value):
    self.value = value
  def __str__(self):
    return repr(self.value)



def main():
  for ra in data_book:
    ra["ISBN"] = arreglar_id(ra["ISBN"])
    datares.append(ra)

  fields = ["ISBN","Book-Title","Book-Author","Year-Of-Publication","Publisher"]
        
  with open("../data-noprocesed/Book-Crossing/BX-Books-step2.csv", "w") as csvfile:
    fieldnames = fields
    writer = csv.DictWriter(csvfile, fieldnames = fieldnames)

    writer.writeheader()
    for dr in datares:
      writer.writerow(dr)    

def arreglar_id(idd):
  for x in xrange(0,len(idd)):
    if idd[x] != '0':
      return idd[x:]
  return 'carajos'

def load_book(file):
  global data_book
  with open(file) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
      data_book.append(row)


load_book("../data-noprocesed/Book-Crossing/BX-Books.csv")
main()


"""

#Ejecutar este primero, aqui estoy quitando los ceros demas que tiene los ISBN en rating file

data_ratings = []

datares = [];
    
class MyError(Exception):
  def __init__(self, value):
    self.value = value
  def __str__(self):
    return repr(self.value)



def main():
  for ra in data_ratings:
    ra["ISBN"] = arreglar_id(ra["ISBN"])
    datares.append(ra)

  fields = ["User-ID", "ISBN", "Book-Rating"]
        
  with open("../data-noprocesed/Book-Crossing/BX-Book-Ratings-clean-step2.csv", "w") as csvfile:
    fieldnames = fields
    writer = csv.DictWriter(csvfile, fieldnames = fieldnames)

    writer.writeheader()
    for dr in datares:
      writer.writerow(dr)    

def arreglar_id(idd):
  for x in xrange(0,len(idd)):
    if idd[x] != '0':
      return idd[x:]
  return 'carajos'

def load_Ratings(file):
  global data_ratings
  with open(file) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
      aux = {}
      aux["User-ID"]          = row["User-ID"]
      aux["ISBN"]             = row["ISBN"]
      aux["Book-Rating"]      = row["Book-Rating"]
      data_ratings.append(aux)  



load_Ratings("../data-noprocesed/Book-Crossing/BX-Book-Ratings-clean-step1.csv")
main()


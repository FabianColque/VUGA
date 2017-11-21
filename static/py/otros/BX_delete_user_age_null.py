import csv
import json
import simplejson

##Format 
#

data_user = []

datares = [];
    
class MyError(Exception):
  def __init__(self, value):
    self.value = value
  def __str__(self):
    return repr(self.value)

def main():
  for du in data_user:
    if du["Age"] != "NULL":
      datares.append(du)

  fields = ["User-ID", "User-name", "Location", "Age"]
        
  with open("../data-noprocesed/Book-Crossing/BX-Users-wo-nulls.csv", "w") as csvfile:
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
      aux["User-ID"]        = row["User-ID"]
      aux["User-name"]      = row["User-name"]
      aux["Location"]       = row["Location"]
      aux["Age"]            = row["Age"]
      data_user.append(aux)


load_users("../data-noprocesed/Book-Crossing/BX-Users.csv")          
main()
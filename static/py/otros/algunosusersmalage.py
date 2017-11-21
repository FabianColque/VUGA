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

  count = 0
  for du in data_user:
    if not isnumber_( str( du["Age"] ) ):
      count = count + 1
  print count

def isnumber_(cadena):
  first_ca = cadena[0]
  last_ca = cadena[len(cadena)-1]
  f = False
  l = False
  if first_ca >= '0' and first_ca <= '9':
    f = True
  if last_ca >= '0' and last_ca <= '9':
    l = True
  return (f and l)


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
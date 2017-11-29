import json
import csv



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
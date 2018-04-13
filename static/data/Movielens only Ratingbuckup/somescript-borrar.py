import simplejson

def save_json(path, data):
  with open( path , "w") as outfile:
    json.dump(data, outfile)      

def load_json(file):
  res = []
  with open(file) as jsonfile:
    res = json.load(jsonfile)
  return res



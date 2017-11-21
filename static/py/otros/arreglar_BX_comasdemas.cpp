#include <iostream>
#include <string>

using namespace std;

int main ()
{

  /*
    Este codigo estoy usando para agregar la columna de name que no estaba existiendo
    
  */

  string line;
  string aux = "";
  string pre = "";
  while(getline(cin, line)){
    aux = "";
    pre = "";
    for (int i = 0; i < line.size(); ++i)
    {
        if(line[i] != ',')
          pre += line[i];
        if(line[i] == ','){
            aux += ",user";
            aux += pre;
            aux += ',';
            aux = aux + line.substr(i+1);
            cout<<aux<<endl;
            break;
        }
        aux += line[i];
    }
  }  
  

  return 0;
}


/*

Este use para soluciona el problemas de las comas de mas que habia en bx-books
El problema era que en la columna book-author, algunos nombres estaban separados
por comas y eso hacia que year publication se recorra a la siguiente columna

Ex. 
g++ arreglar_BX_comasdemas.cpp -o arr
./arr < ../data-noprocesed/Book-Crossing/BX-Books.csv > holis.csv

string line;
  int comas_limit = 7;
  int comas_count = 0;
  string aux = "";
  
  int cc = 0;
  while(getline (std::cin,line)){
    comas_count = 0;
    aux = "";
    
    for(int i = 0; i < line.size(); i++){
        
        if(line[i] == ',')
            comas_count++;
        if(comas_count == 3){
            if(cc > 0 && (line[i+1] < '0' || line[i+1] > '9')){
                aux = aux + line.substr(i+1);
                
                //i = line.size() + 1212;
                break;
            }else{
                aux = aux + line.substr(i);
                break;
            }

        }else{
            aux += line[i];
        }
        
    }
    cc++;
    cout<<aux<<endl;
  }

*/
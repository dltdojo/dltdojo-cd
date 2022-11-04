# diagram 101

```
                      ,-.  
                      `-'  
                      /|\  
     ,---.             |   
     |Bob|            / \  
     `-+-'           Alice 
       |    hello      |   
       |-------------->|   
       |               |   
       |  Is it ok?    |   
       |<--------------|   
     ,-+-.           Alice 
     |Bob|            ,-.  
     `---'            `-'  
                      /|\  
                       |   
                      / \  

```


# Plantuml

```
@startuml
participant Bob
actor Alice

Bob -> Alice : hello
Alice -> Bob : Is it ok?
@enduml
```
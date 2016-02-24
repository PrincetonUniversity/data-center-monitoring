

import string
import time
import smbus

def sensorscan():
    bus = smbus.SMBus(1)
    
    #address loop/scan mechanic
    #i2C detect!! command line?
    #open file
    
    f = open("output1.txt", "r")
    line = f.readline()
    line = f.readline()
    i = 0
    
    #print line
    addresses = []
    
    #check for empty string
    while len(line) != 0:
        #print line3
        a,temp,b = line.partition(' ')
        
        while len(b) != 0:
            a,temp,b = b.partition(' ')
            
            #print temp
            if all (c in string.hexdigits for c in a) and not not a:
                val = int(a, 16)
                #print val
                addresses.append(val)
                i += 1
                
        line = f.readline()
        
        
        #print line
        #print line3
        
    return addresses
        
        #sensorscan()
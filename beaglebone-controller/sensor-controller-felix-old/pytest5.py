

"sensorread1.py: Return data from sensor."

import time 
import smbus 
import pyscan2

def sensorread():
    bus = smbus.SMBus(2) 
    #print("hello")
    
    addr = pyscan2.sensorscan()
    
    #print addr
    #return addr
    
    stroutput = []
    
    i= 0
    
    while i < len(addr):
        #output = bus.read_byte_data(addr[i], 00) 
        bus.write_byte_data(addr[i], 01, 96)
        output2 = bus.read_word_data(addr[i], 00)
        output = (output2 & 255) + ((output2 >> 12) * (1/16.0)) 
        stroutput.append(output)
        i+=1
        
        #time.sleep(10)
    
    #print stroutput 
    
    return stroutput
    
#sensorread()
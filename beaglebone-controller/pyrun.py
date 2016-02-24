
import pytest6
import pytest5 
import schedule
import time 
import smbus 
import subprocess
import mysql.connector
import dbAdd
from mysql.connector import Error

#print "Content-type:text/html\r\n\r\n"
#a = """<html><head><title>pyrun8 BBB</title></head> <body>""" 
#print a

#c = """<br>"""

#for i in range(1,30):
def pyrun():
    f1 = open("output1.txt", "w") 
    f2 = open("output2.txt", "w") 
    
    subprocess.check_call(['/usr/sbin/i2cdetect', '-y', '-r', '1'], stdout=f1)
    subprocess.check_call(['/usr/sbin/i2cdetect', '-y', '-r', '2'], stdout=f2)
    
    #print "round " 
    #print i
    #print c
    output1 = pytest6.sensorread() 
    output2 = pytest5.sensorread()
    
    output1.extend(output2)
    
    #print output1
    dbAdd.insertTemp(output1)
    #print c
    #readable = time.asctime() 
    #store = time.localtime()
    #print store
    #print c
    #print readable
    #print int(time.time()) 
    #print c
    #print c
    subprocess.check_call(['rm', '-rf', 'output1.txt']) 
    subprocess.check_call(['rm', '-rf', 'output2.txt']) 



schedule.every(0.5).seconds.do(pyrun)

while 1:
    schedule.run_pending()
    time.sleep(1)
    
#time.sleep(5)

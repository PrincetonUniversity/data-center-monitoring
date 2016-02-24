
#!/usr/bin/python 
import pytest5 
import time 
import smbus 
import subprocess

print "Content-type:text/html\r\n\r\n"
a = """<html>
<head><title>pyrun8 BBB</title></head> <body>
""" 

#print a

c = """<br>"""

#for i in range(1,30):
f = open("output.txt", "w") 
subprocess.check_call(['/usr/sbin/i2cdetect', '-y', '-r', '2'], stdout=f)
#print "round " 
#print i
#print c

output = pytest5.sensorread() 

print output
#print c

readable = time.asctime() 
store = time.localtime() 
val = time.time()

#print store #print c
#print readable print int(val) 
#print c

subprocess.check_call(['rm', '-rf', 'output.txt']) 

#time.sleep(10)
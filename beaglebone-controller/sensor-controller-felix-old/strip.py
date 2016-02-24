
#!usr/bin/python
import subprocess 
import time

#assume already created database for values
fw = open("pyrun1.py", "w")

ret = subprocess.check_call(['/usr/local/bin/curl', '-sS', 'bbb2.ee.princeton.edu:8080/pyrun1.py'], stdout=fw)
fw.close()

f = open("pyrun1.py", "r") 
blankline = f.readline() 
addressline = f.readline() 
templine = f.readline() 
timeline = f.readline() 
f.close()

addr = addressline.split(',')

addr[0] = addr[0][1:]
#>>> print addr
#['44', '54', '72', '79', '116', '117', '118', '119]\n'] 

addr[-1] = addr[-1][:-2]
temp = templine.split(' ')
#>>> print temp
#['20', '20', '20', '20', '20', '20', '20', '20', '\n'] 

temp = temp[:-1]
time = timeline[:-1]

#do something with the values
fres = open("results.txt", "a")
fres.write(time + '\n' + ', '.join(addr) + '\n' + ', '.join(temp) + '\n') 
fres.close()

#kill pyrun1.py
subprocess.check_call(['rm', '-rf', 'pyrun1.py'])

#pyrun2.py
#assume already created database for values
fw = open("pyrun2.py", "w")
ret = subprocess.check_call(['/usr/local/bin/curl', '-sS', 'bbb2.ee.princeton.edu:8080/pyrun2.py'],stdout=fw) 

fw.close()

f = open("pyrun2.py", "r") 
blankline = f.readline() 
addressline = f.readline() 
templine = f.readline() 
timeline = f.readline() 
f.close()
addr = addressline.split(',')

addr[0] = addr[0][1:]
#>>> print addr
#['44', '54', '72', '79', '116', '117', '118', '119]\n'] 

addr[-1] = addr[-1][:-2]
temp = templine.split(' ')
#>>> print temp
#['20', '20', '20', '20', '20', '20', '20', '20', '\n'] 

temp = temp[:-1]
time = timeline[:-1]
#do something with the values

fres = open("results.txt", "a")
fres.write(time + '\n' + ', '.join(addr) + '\n' + ', '.join(temp) + '\n') fres.close()
#kill pyrun1.py
subprocess.check_call(['rm', '-rf', 'pyrun2.py'])




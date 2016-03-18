

import string
import smbus
import subprocess
import time
import calendar

class SensorBus:

    def __init__(self, bus, status):
        self.status = status
        if bus == 1 or bus == 2:
            self.busnum = bus
            self.bus = smbus.SMBus(bus)

    def scan(self):

        # Grab i2cdetect output for given bus
        scanoutput = open("scanoutput.txt", "w")
        subprocess.check_call(['/usr/sbin/i2cdetect', '-y', '-r', str(self.busnum)], stdout=scanoutput)

        # Start reading i2cdetect output
        f = open("scanoutput.txt", "r")

        # Skip the top line line
        f.readline()
        line = f.readline()

        # Parse text for device addresses, place them in array
        i = 0
        addresses = []

        #check for empty string
        while len(line) != 0:
            a,temp,b = line.partition(' ')

            while len(b) != 0:
                a,temp,b = b.partition(' ')

                if all (c in string.hexdigits for c in a) and not not a:
                    val = int(a, 16)
                    addresses.append(val)
                    i += 1

            line = f.readline()

        subprocess.check_call(['rm', '-rf', 'scanoutput.txt'])
        return addresses

    def get_readings(self, addrs):

        readings = []

        if len(addrs) > 0:

            i= 0

            # Read temp data (in degrees C) for each sensor in addrs

            timestamp = time.time()

            try:
                while i < len(addrs):
                    # Issue command to take a reading
                    self.bus.write_byte_data(addrs[i], 01, 96)
                    # Read back the returned reading
                    tmp = self.bus.read_word_data(addrs[i], 00)
                    # Convert to degrees C
                    temperature = (tmp & 255) + ((tmp >> 12) * (1/16.0))
                    reading = {
                        'controller' : self.status['mac'],
                        'bus' : self.busnum,
                        'sensor_addr' : addrs[i],
                        'time' : timestamp,
                        'temp' : temperature
                    }
                    readings.append(reading)
                    i+=1
            except IOError, err:
                self.status['err'] = True
                self.status['type'] = "IOError"
                self.status['err'] = err
                self.status['ioerr_addr'] = addrs[i]
                self.status['num_tries'] += 1

        return readings

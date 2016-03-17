
import sensorbus
import schedule
import time

def pyrun():

    # 2 I2C buses are used
    bus1 = sensorbus.SensorBus(1)
    readings = bus1.get_readings(bus1.scan())
    print readings

schedule.every(0.5).seconds.do(pyrun)

while 1:
    schedule.run_pending()
    time.sleep(1)

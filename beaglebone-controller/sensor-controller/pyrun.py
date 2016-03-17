
import sensorbus
import schedule
import time
from status import Status
import com

def pyrun():

    board_status = Status().status

    # Detect devices and get readings from all devices on both buses
    bus1 = sensorbus.SensorBus(1, board_status)
    readings1 = bus1.get_readings(bus1.scan())
    bus2 = sensorbus.SensorBus(2, board_status)
    readings2 = bus1.get_readings(bus2.scan())
    readings = readings1 + readings2

    # Traces
    if not board_status['err']:
        print readings
    else:
        print board_status['type']
        print board_status['msg']
        print board_status['ioerr_addr']

    # Send readings to server (non-blocking)
    com.send_to_server(readings)

# Re-run every second
schedule.every(1).seconds.do(pyrun)
while 1:
    schedule.run_pending()
    time.sleep(1)

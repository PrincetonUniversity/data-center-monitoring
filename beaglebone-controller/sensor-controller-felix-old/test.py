import schedule
import time

def job():
    print("I'm working...")

schedule.every(5).seconds.do(job)

while 1:
    schedule.run_pending()
    time.sleep(1)
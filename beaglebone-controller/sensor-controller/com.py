import requests
from requests import ConnectionError
import json
import sys
import os

server = 'http://dcsense.ee.princeton.edu/api/sensors/submitreadings'

def send_to_server(data):

    # Execute post request to server asynchronously
    try:
        newpid = os.fork()
        if newpid == 0:
            try:
                headers = {'content-type': 'application/json'}
                requests.post(server, headers=headers, data=json.dumps(data))
            except ConnectionError, err:
                sys.stderr.write('Could not contact server:\n' + str(err))
            sys.exit()
    except OSError, err:
        sys.stderr.write('OSError on call to fork(): \n' + err)
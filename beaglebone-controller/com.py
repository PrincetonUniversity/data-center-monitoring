import requests
from requests import ConnectionError
import json
import sys
import os

server = 'http://dcsense.ee.princeton.edu/api/sensors/submitreadings'


def send_to_server(data, board_status):
  # Execute post request to server asynchronously
  try:
    newpid = os.fork()
    if newpid == 0:
      try:
        http_proxy = "http://128.112.48.208:3128"
        https_proxy = "https://128.112.48.208:1080"
        ftp_proxy = "ftp://128.112.48.208:3128"

        proxyDict = {
          "http": http_proxy,
          "https": https_proxy,
          "ftp": ftp_proxy
        }

        payload = {
          'data': data,
          'status': board_status
        }
        headers = {'content-type': 'application/json'}
        requests.post(server, headers=headers, data=json.dumps(payload), proxies=proxyDict)
      except ConnectionError, err:
        sys.stderr.write('Could not contact server:\n' + str(err))
      os._exit(0)  # Kill child process
      print "Wasn't supposed to get here."
    else:
      os.waitpid(0, os.WNOHANG)  # Clear zombie child process
  except OSError, err:
    sys.stderr.write('OSError on call to fork(): \n' + err)

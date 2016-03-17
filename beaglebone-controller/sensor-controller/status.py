from uuid import getnode as get_mac

class Status:
    def __init__(self):
        self.reset()

    def reset(self):
        self.status = {
            'mac' : get_mac(),
            'err' : False,
            'type' : '',
            'err' : '',
            'ioerr_addr' : -1,
            'num_tries' : 0
        }

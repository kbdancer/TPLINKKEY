#!/usr/bin/env python
# coding=utf-8

import requests
import sqlite3
import json
import sys


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


def query_all_data():
    my_sqlite_db = Database()
    email = "1@q.com"
    userkey = "533c5860eb77209af901d8bf300d7ec3"
    try:
        query_by_sql = 'SELECT * FROM scanlog WHERE mac != ""'
        query_list = my_sqlite_db.query(query_by_sql, [])

        for row in query_list:
            this_host = row[1]
            this_mac = row[2]
            this_ssid = row[3]
            this_key = row[4]
            this_country = row[5]
            this_province = row[6]
            this_city = row[7]
            this_isp = row[8]

            wifi_data = {
                "host": this_host, "mac": this_mac, "wifikey": this_key,
                "ssid": this_ssid, "country": this_country, "province": this_province,
                "city": this_city, "isp": this_isp, "email": email,
                "key": userkey
            }

            save_data_to_server(wifi_data)

    except Exception as e:
        print(e)


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
    query_all_data()

#!/usr/bin/env python
# coding=utf-8

from flask import Flask, render_template, request
import sqlite3
import json
import sys

reload(sys)
sys.setdefaultencoding('utf8')


app = Flask(__name__)


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


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/get_wifi', methods=['POST'])
def get_wifi():
    my_sqlite_db = Database()
    page = int(request.form.get('page'))
    rows = int(request.form.get('rows'))
    limit_count = (page - 1) * rows
    wifi_info = []
    query_length = 0

    try:
        query_length_sql = "SELECT count(id) FROM scanlog"
        query_length = my_sqlite_db.query(query_length_sql, [])[0][0]
    except Exception, e:
        print e

    try:
        query_by_sql = 'SELECT * FROM scanlog order by createtime desc limit ?,?'
        query_list = my_sqlite_db.query(query_by_sql, [limit_count, rows])

        for row in query_list:
            this_id = row[0]
            this_host = row[1]
            this_mac = row[2]
            this_ssid = row[3]
            this_key = row[4]
            this_country = row[5]
            this_province = row[6]
            this_city = row[7]
            this_isp = row[8]
            this_time = row[9]

            wifi_info.append({
                "id": this_id, "ip": this_host, "time": this_time,
                "mac": this_mac, "key": this_key, "ssid": this_ssid,
                 "country": this_country, "province": this_province,
                "city": this_city, "isp": this_isp
            })

        return json.dumps({"rows": wifi_info, "total": query_length})

    except Exception, e:
        print e


if __name__ == '__main__':
    app.run(debug=True)

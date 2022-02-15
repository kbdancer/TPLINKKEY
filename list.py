#!/usr/bin/env python
# coding=utf-8

from flask import Flask, render_template, request
import sqlite3
import json
import sys

app = Flask(__name__)
app.jinja_env.variable_start_string = '{{ '
app.jinja_env.variable_end_string = ' }}'


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
    except Exception as e:
        print(e)

    try:
        query_by_sql = "SELECT * FROM scanlog order by createtime desc limit ?,?"
        query_list = my_sqlite_db.query(query_by_sql, [limit_count, rows])

        for row in query_list:
            wifi_info.append({
                "id": row[0], "ip": row[1], "time": row[9],
                "mac": row[2], "key": row[4], "ssid": row[3],
                "country": row[5], "province": row[6],
                "city": row[7], "isp": row[8]
            })

        return json.dumps({"rows": wifi_info, "total": query_length})

    except Exception as e:
        print(e)


if __name__ == '__main__':
    app.run(debug=True)

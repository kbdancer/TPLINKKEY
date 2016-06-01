#!/usr/bin/env python
# coding=utf-8
# code by 92ez.com

import sqlite3
import json
import web
import sys

reload(sys)
sys.setdefaultencoding('utf8')

urls = (
    "/", "index",
    "/getWifi", "queryWifi"
)

# static
render = web.template.render('static', cache=False)

class index:
    def GET(self):
        return render.index("static")

class queryWifi:
    def POST(self):
        page = int(web.input().get("page"))
        rows = int(web.input().get("rows"))
        limitCount = (page - 1) * rows
        WifiStr = []
        queryLength = 0

        try:
            cx = sqlite3.connect(sys.path[0]+"/TPLINKKEY.db")
            cu = cx.cursor()
            queryCount = cu.execute("SELECT count(id) FROM scanlog")
            queryLength = queryCount.fetchone()[0]
            cu.close()
            cx.close()
        except Exception, e:
            print e

        try:
            cx = sqlite3.connect(sys.path[0]+"/TPLINKKEY.db")
            cu = cx.cursor()
            queryList = cu.execute("SELECT * FROM scanlog order by createtime desc limit %d,%d" % (limitCount,rows))

            for row in queryList.fetchall():
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

                WifiStr.append({"id":this_id,"ip": this_host, "time": this_time, "mac": this_mac,"key": this_key, "ssid": this_ssid,"country":this_country,"province":this_province,"city":this_city,"isp":this_isp})
            
            cu.close()
            cx.close()
            
            return json.dumps({"rows":WifiStr,"total":queryLength})
        
        except Exception, e:
            print e

if __name__ == '__main__':
    app = web.application(urls, globals())
    app.run()

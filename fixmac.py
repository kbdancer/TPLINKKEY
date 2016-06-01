#!/usr/bin/env python
# coding=utf-8
# code by 92ez.com

import sqlite3
import sys

def fixmacstr():
    try:
        cx = sqlite3.connect(sys.path[0]+"/TPLINKKEY.db")
        cu = cx.cursor()
        wrongids = cu.execute("SELECT id,mac FROM scanlog where mac like '%\r'")

        print 'Found %d wrong items.' % len(wrongids.fetchall())

        for row in wrongids.fetchall():
            cu.execute("UPDATE scanlog SET mac = '%s' where id = %d" % (row[1].replace('\r',''),row[0]))
            cx.commit()
        cu.close()
        cx.close()
    except Exception, e:
        print e

if __name__ == '__main__':
    fixmacstr()